import type { RespuestaCruda } from "../api";
import { auth } from "../firebase";
import { PATRON_USERNAME, TOTAL_AVATARES, type DatosRegistro, type DatosUsername, type Usuario } from "../tipos";

// MODO MOCK (VITE_USE_MOCKS=true): responde en el navegador las rutas de usuarios mientras la API no las tenga.
// Firebase Auth sigue siendo real: el mock toma el uid, el correo y el nombre del usuario que ingresó.
// Los perfiles se guardan en localStorage para que sobrevivan a una recarga.
//
// Para probar los errores:
//   - 409 USERNAME_TAKEN: usa un nombre de usuario ya tomado, por ejemplo «admin».
//   - 409 EMAIL_TAKEN:    registra un perfil con un correo que ya tenga perfil (el de «admin» es admin@correo.com).
//   - 400 VALIDATION:     envía nombres o apellidos vacíos, un username inválido o un avatar fuera de rango.
//
// Este archivo solo se carga con import() dinámico cuando el modo mock está activo, así no entra en producción.

const CLAVE = "mockUsuarios";
const DEMORA_MS = 600;

const SEMILLA: Usuario[] = [
  { uid: "mock-admin", nombres: "Admin", apellidos: "Salón", username: "admin", correo: "admin@correo.com", avatar: 0 },
];

let memoria: Usuario[] | null = null;

function leer(): Usuario[] {
  if (memoria) return memoria;
  try {
    const texto = localStorage.getItem(CLAVE);
    memoria = texto ? (JSON.parse(texto) as Usuario[]) : [...SEMILLA];
  } catch {
    memoria = [...SEMILLA];
  }
  return memoria;
}

function guardar(usuarios: Usuario[]): void {
  memoria = usuarios;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(usuarios));
  } catch {
    /* sin almacenamiento, los perfiles solo duran esta visita */
  }
}

function responder(status: number, cuerpo: unknown): RespuestaCruda {
  return { status, ok: status >= 200 && status < 300, json: async () => cuerpo };
}

function error(status: number, code: string, message: string, fields?: Record<string, string>): RespuestaCruda {
  return responder(status, { error: { code, message, ...(fields ? { fields } : {}) } });
}

function esperar(ms: number, signal?: AbortSignal | null): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const temporizador = setTimeout(resolver, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(temporizador);
      rechazar(new DOMException("La petición se canceló.", "AbortError"));
    });
  });
}

function leerCuerpo(init: RequestInit): Record<string, unknown> {
  try {
    const valor: unknown = typeof init.body === "string" ? JSON.parse(init.body) : {};
    return typeof valor === "object" && valor !== null ? (valor as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const mismoUsername = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function validarUsername(valor: unknown): string | null {
  if (typeof valor !== "string" || !valor.trim()) return "Elige un nombre de usuario.";
  if (!PATRON_USERNAME.test(valor.trim())) return "Usa de 3 a 20 letras, números o guion bajo, sin espacios.";
  return null;
}

function crearUsuario(uid: string, correo: string, cuerpo: Partial<Record<keyof DatosRegistro, unknown>>): RespuestaCruda {
  const campos: Record<string, string> = {};
  if (typeof cuerpo.nombres !== "string" || !cuerpo.nombres.trim()) campos.nombres = "Escribe tus nombres.";
  if (typeof cuerpo.apellidos !== "string" || !cuerpo.apellidos.trim()) campos.apellidos = "Escribe tus apellidos.";
  const errorUsername = validarUsername(cuerpo.username);
  if (errorUsername) campos.username = errorUsername;
  const avatar = cuerpo.avatar ?? 0;
  if (typeof avatar !== "number" || !Number.isInteger(avatar) || avatar < 0 || avatar >= TOTAL_AVATARES)
    campos.avatar = "Elige uno de los avatares disponibles.";
  if (Object.keys(campos).length > 0) return error(400, "VALIDATION", "Revisa los campos marcados.", campos);

  const usuarios = leer();
  const username = (cuerpo.username as string).trim();
  if (usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase()))
    return error(409, "EMAIL_TAKEN", "Este correo ya está registrado.");
  if (usuarios.some((u) => mismoUsername(u.username, username)))
    return error(409, "USERNAME_TAKEN", "Ese nombre de usuario ya existe. Elige otro.");

  const nuevo: Usuario = {
    uid,
    correo,
    username,
    nombres: (cuerpo.nombres as string).trim(),
    apellidos: (cuerpo.apellidos as string).trim(),
    avatar: avatar as number,
  };
  guardar([...usuarios, nuevo]);
  return responder(201, nuevo);
}

function elegirUsername(uid: string, correo: string, nombreVisible: string, cuerpo: Partial<Record<keyof DatosUsername, unknown>>): RespuestaCruda {
  const errorUsername = validarUsername(cuerpo.username);
  if (errorUsername) return error(400, "VALIDATION", "Revisa los campos marcados.", { username: errorUsername });

  const usuarios = leer();
  const username = (cuerpo.username as string).trim();
  if (usuarios.some((u) => u.uid !== uid && mismoUsername(u.username, username)))
    return error(409, "USERNAME_TAKEN", "Ese nombre de usuario ya existe. Elige otro.");

  const actual = usuarios.find((u) => u.uid === uid);
  if (actual) {
    const actualizado = { ...actual, username };
    guardar(usuarios.map((u) => (u.uid === uid ? actualizado : u)));
    return responder(200, actualizado);
  }
  if (usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase()))
    return error(409, "EMAIL_TAKEN", "Este correo ya está registrado.");

  // Perfil nuevo (por ejemplo, tras ingresar con Google): nombres y apellidos salen del nombre de la cuenta.
  const [nombres = "", ...resto] = nombreVisible.trim().split(/\s+/);
  const nuevo: Usuario = { uid, correo, username, nombres: nombres || username, apellidos: resto.join(" "), avatar: 0 };
  guardar([...usuarios, nuevo]);
  return responder(201, nuevo);
}

// Devuelve la respuesta simulada, o null si la ruta no es de las que simula (entonces se usa la API real).
export async function responderMock(ruta: string, init: RequestInit): Promise<RespuestaCruda | null> {
  const metodo = (init.method ?? "GET").toUpperCase();
  const camino = ruta.split("?")[0].replace(/\/$/, "");
  const conocida =
    (metodo === "POST" && camino === "/api/v1/users") ||
    (metodo === "GET" && camino === "/api/v1/users/me") ||
    (metodo === "POST" && camino === "/api/v1/users/me/username");
  if (!conocida) return null;

  await esperar(DEMORA_MS, init.signal);

  const encabezados = new Headers(init.headers);
  const usuarioFirebase = auth?.currentUser;
  if (!encabezados.get("Authorization")?.startsWith("Bearer ") || !usuarioFirebase)
    return error(401, "UNAUTHENTICATED", "Tu sesión expiró. Vuelve a ingresar.");

  const { uid } = usuarioFirebase;
  const correo = usuarioFirebase.email ?? "";

  if (metodo === "GET") {
    const perfil = leer().find((u) => u.uid === uid);
    return perfil ? responder(200, perfil) : error(404, "PROFILE_INCOMPLETE", "Elige un nombre de usuario para continuar.");
  }
  if (camino === "/api/v1/users") return crearUsuario(uid, correo, leerCuerpo(init));
  return elegirUsername(uid, correo, usuarioFirebase.displayName ?? "", leerCuerpo(init));
}
