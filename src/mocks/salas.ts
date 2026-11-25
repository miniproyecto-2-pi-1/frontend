import type { RespuestaCruda } from "../api";
import { auth } from "../firebase";
import type { Mensaje, SalaDatos } from "../tipos";
import { USUARIO_MOCK } from "./usuario";

// MODO MOCK de salas y chat: responde en el navegador las rutas /api/v1/rooms mientras la API no las tenga.
// Los datos se guardan en localStorage para que sobrevivan a una recarga.
//
// Salas de ejemplo (la persona simulada es «camila», uid mock-camila):
//   K7P2-91XQ «Cálculo II»           → la creó camila (anfitriona) y tiene 60 mensajes (para probar «cargar anteriores»).
//   M4T8-27ZB «Proyecto Integrador»  → la creó camila y está vacía (para probar el historial vacío).
//   R9D1-55LC «Física Mecánica»      → la creó otra persona (camila entra como invitada) y tiene 3 mensajes.
//
// Para probar el error del historial: en la consola, localStorage.setItem("mockFallaHistorial", "1") (y removeItem para quitarlo).

interface SalaGuardada {
  id: string;
  nombre: string;
  creadaEn: string;
  ownerUid: string;
}

const CLAVE_SALAS = "mockSalas";
const CLAVE_MENSAJES = "mockMensajes";
const MAXIMO_NOMBRE = 50;
const POR_PAGINA = 50;

const AUTORES = [
  { uid: "mock-juan", username: "Juan" },
  { uid: "mock-maria", username: "María" },
  { uid: USUARIO_MOCK.uid, username: USUARIO_MOCK.username },
  { uid: "mock-pablo", username: "Pablo" },
];

function semillaMensajes(roomId: string, cantidad: number): Mensaje[] {
  const textos = [
    "Mañana repasamos integrales a las 4.",
    "Perfecto. Yo llevo los ejercicios.",
    "¿Alguien resolvió el ejercicio 4 de límites?",
    "Sí, te paso el enlace a mis notas.",
    "Gracias, lo reviso ahora.",
    "¿Empezamos con el ejercicio 3?",
  ];
  const ahora = Date.now();
  return Array.from({ length: cantidad }, (_, i) => {
    const autor = AUTORES[i % AUTORES.length];
    return {
      id: `${roomId}-semilla-${String(i).padStart(3, "0")}`,
      uid: autor.uid,
      username: autor.username,
      texto: `${textos[i % textos.length]} (${i + 1})`,
      creadoEn: new Date(ahora - (cantidad - i) * 12 * 60_000).toISOString(),
    };
  });
}

function semillaSalas(): SalaGuardada[] {
  const ahora = Date.now();
  return [
    { id: "K7P2-91XQ", nombre: "Cálculo II", creadaEn: new Date(ahora - 3 * 86_400_000).toISOString(), ownerUid: USUARIO_MOCK.uid },
    { id: "M4T8-27ZB", nombre: "Proyecto Integrador", creadaEn: new Date(ahora - 2 * 86_400_000).toISOString(), ownerUid: USUARIO_MOCK.uid },
    { id: "R9D1-55LC", nombre: "Física Mecánica", creadaEn: new Date(ahora - 86_400_000).toISOString(), ownerUid: "mock-otra-persona" },
  ];
}

function leer<T>(clave: string, semilla: () => T): T {
  try {
    const texto = localStorage.getItem(clave);
    if (texto) return JSON.parse(texto) as T;
  } catch {
    /* sin almacenamiento: se usan los datos de ejemplo */
  }
  return semilla();
}

function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento, los datos solo duran esta visita */
  }
}

const leerSalas = () => leer<SalaGuardada[]>(CLAVE_SALAS, semillaSalas);
const leerMensajes = () =>
  leer<Record<string, Mensaje[]>>(CLAVE_MENSAJES, () => ({
    "K7P2-91XQ": semillaMensajes("K7P2-91XQ", 60),
    "R9D1-55LC": semillaMensajes("R9D1-55LC", 3),
  }));

function leerBandera(clave: string): boolean {
  try {
    return localStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}

const uidActual = () => auth?.currentUser?.uid ?? USUARIO_MOCK.uid;

const normalizarId = (id: string) => decodeURIComponent(id).trim().toUpperCase();

export function existeSala(id: string): boolean {
  return leerSalas().some((s) => s.id === normalizarId(id));
}

export function guardarMensaje(roomId: string, mensaje: Mensaje): void {
  const todos = leerMensajes();
  todos[roomId] = [...(todos[roomId] ?? []), mensaje];
  guardar(CLAVE_MENSAJES, todos);
}

function responder(status: number, cuerpo: unknown): RespuestaCruda {
  return { status, ok: status >= 200 && status < 300, json: async () => cuerpo };
}

function error(status: number, code: string, message: string, fields?: Record<string, string>): RespuestaCruda {
  return responder(status, { error: { code, message, ...(fields ? { fields } : {}) } });
}

const noEncontrada = () => error(404, "ROOM_NOT_FOUND", "Sala no encontrada. Revisa el ID.");

function paraElFrontend(sala: SalaGuardada): SalaDatos {
  return { id: sala.id, nombre: sala.nombre, creadaEn: sala.creadaEn, esAdministrador: sala.ownerUid === uidActual() };
}

function validarNombre(cuerpo: Record<string, unknown>): { nombre: string } | RespuestaCruda {
  const nombre = typeof cuerpo.nombre === "string" ? cuerpo.nombre.trim() : "";
  if (nombre.length < 1 || nombre.length > MAXIMO_NOMBRE)
    return error(400, "VALIDATION", "Revisa los campos marcados.", { nombre: `Escribe un nombre de 1 a ${MAXIMO_NOMBRE} caracteres.` });
  return { nombre };
}

// Devuelve la respuesta simulada, o null si la ruta no es de salas.
export function responderSalas(
  metodo: string,
  camino: string,
  consulta: URLSearchParams,
  cuerpo: Record<string, unknown>,
): RespuestaCruda | null {
  const partes = camino.match(/^\/api\/v1\/rooms(?:\/([^/]+))?(?:\/(messages))?$/);
  if (!partes) return null;
  const [, idCrudo, subruta] = partes;
  const salas = leerSalas();

  if (!idCrudo) {
    if (metodo === "GET") {
      const propias = salas.filter((s) => s.ownerUid === uidActual()).sort((a, b) => b.creadaEn.localeCompare(a.creadaEn));
      return responder(200, propias.map(paraElFrontend));
    }
    if (metodo === "POST") {
      const valido = validarNombre(cuerpo);
      if (!("nombre" in valido)) return valido;
      const nueva: SalaGuardada = {
        id: `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        nombre: valido.nombre,
        creadaEn: new Date().toISOString(),
        ownerUid: uidActual(),
      };
      guardar(CLAVE_SALAS, [...salas, nueva]);
      return responder(201, paraElFrontend(nueva));
    }
    return null;
  }

  const id = normalizarId(idCrudo);
  const sala = /^[A-Z0-9-]{1,20}$/.test(id) ? salas.find((s) => s.id === id) : undefined;
  if (!sala) return noEncontrada();

  if (subruta === "messages") {
    if (metodo !== "GET") return null;
    if (leerBandera("mockFallaHistorial")) return error(500, "INTERNAL_ERROR", "Ocurrió un error inesperado. Intenta de nuevo más tarde.");
    const todos = (leerMensajes()[id] ?? []).slice().sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
    const limite = Math.min(Math.max(Number(consulta.get("limite")) || POR_PAGINA, 1), 100);
    const antes = consulta.get("antes");
    const anteriores = antes ? todos.filter((m) => m.creadoEn < antes) : todos;
    const pagina = anteriores.slice(-limite);
    return responder(200, { mensajes: pagina, hayMas: anteriores.length > pagina.length });
  }

  if (metodo === "GET") return responder(200, paraElFrontend(sala));

  // Editar y eliminar son solo del anfitrión (la API real responde 403 igual).
  if (sala.ownerUid !== uidActual()) return error(403, "FORBIDDEN", "Solo el anfitrión puede editar o eliminar la sala.");

  if (metodo === "PATCH") {
    const valido = validarNombre(cuerpo);
    if (!("nombre" in valido)) return valido;
    const actualizada = { ...sala, nombre: valido.nombre };
    guardar(CLAVE_SALAS, salas.map((s) => (s.id === id ? actualizada : s)));
    return responder(200, paraElFrontend(actualizada));
  }
  if (metodo === "DELETE") {
    guardar(CLAVE_SALAS, salas.filter((s) => s.id !== id));
    const todos = leerMensajes();
    delete todos[id];
    guardar(CLAVE_MENSAJES, todos);
    return responder(204, null);
  }
  return null;
}
