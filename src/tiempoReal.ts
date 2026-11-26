import { io, type Socket } from "socket.io-client";
import { REALTIME_URL } from "./config";
import { auth } from "./firebase";
import type { Mensaje, Persona } from "./tipos";

// Cliente del servidor de tiempo real (backend-realtime, Socket.IO).
//
// Lo que el navegador ENVÍA (cada evento recibe un acuse { ok, error? }):
//   «unirse»  { roomId }          → entrar a la sala; la sala debe existir.
//   «mensaje» { roomId, texto }   → escribir en el chat de la sala.
//   «salir»   { roomId }          → salir de la sala (la conexión sigue abierta).
//
// Lo que el servidor ENVÍA a quienes están en la sala:
//   «presencia»        { roomId, personas }   → quién está conectado ahora.
//   «mensaje»          { id, uid, username, texto, creadoEn }
//   «sala-eliminada»   { roomId }             → el anfitrión eliminó la sala (pendiente en backend-realtime).
//   «sala-actualizada» { roomId, nombre }     → el anfitrión cambió el nombre (pendiente en backend-realtime).

export type EstadoConexion = "conectando" | "conectado" | "reconectando" | "sin-conexion";

export interface ClienteSala {
  // Entra a la sala. Rechaza con un Error cuyo mensaje se puede mostrar tal cual.
  unirse: (roomId: string) => Promise<void>;
  // Envía un mensaje. Rechaza con un Error cuyo mensaje se puede mostrar tal cual.
  enviar: (roomId: string, texto: string) => Promise<void>;
  salir: (roomId: string) => void;
  // Cada alXxx devuelve la función que quita el oyente.
  alMensaje: (oyente: (mensaje: Mensaje) => void) => () => void;
  alPresencia: (oyente: (personas: Persona[]) => void) => () => void;
  alSalaEliminada: (oyente: () => void) => () => void;
  alSalaActualizada: (oyente: (nombre: string) => void) => () => void;
  alEstado: (oyente: (estado: EstadoConexion) => void) => () => void;
  cerrar: () => void;
}

const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const ESPERA_ACUSE_MS = 10_000;
export const ERROR_GENERAL = "No pudimos completar la acción. Inténtalo de nuevo.";
const ERROR_SIN_CONEXION = "No hay conexión con la sala. Revisa tu internet e inténtalo de nuevo.";

interface Acuse {
  ok: boolean;
  error?: string;
}

async function emitir(socket: Socket, evento: string, datos: unknown): Promise<void> {
  if (!socket.connected) throw new Error(ERROR_SIN_CONEXION);
  let acuse: Acuse;
  try {
    acuse = (await socket.timeout(ESPERA_ACUSE_MS).emitWithAck(evento, datos)) as Acuse;
  } catch {
    throw new Error(ERROR_GENERAL); // el servidor no respondió a tiempo
  }
  if (!acuse.ok) throw new Error(acuse.error || ERROR_GENERAL);
}

// Mantiene una lista de oyentes y devuelve cómo agregar y quitar.
function crearOyentes<T>() {
  const lista = new Set<(valor: T) => void>();
  return {
    agregar(oyente: (valor: T) => void) {
      lista.add(oyente);
      return () => {
        lista.delete(oyente);
      };
    },
    avisar(valor: T) {
      lista.forEach((oyente) => oyente(valor));
    },
  };
}

function crearClienteReal(): ClienteSala {
  const mensajes = crearOyentes<Mensaje>();
  const presencia = crearOyentes<Persona[]>();
  const eliminada = crearOyentes<void>();
  const actualizada = crearOyentes<string>();
  const estados = crearOyentes<EstadoConexion>();
  const unidas = new Set<string>(); // salas a las que hay que volver a entrar si se cae la conexión
  let ultimoEstado: EstadoConexion = "conectando";
  let habiaConectado = false;

  const cambiarEstado = (estado: EstadoConexion) => {
    ultimoEstado = estado;
    estados.avisar(estado);
  };

  // El idToken se pide en cada (re)conexión: Firebase lo renueva solo.
  const socket: Socket = io(REALTIME_URL, {
    auth: (entregar) => {
      void Promise.resolve(auth?.currentUser?.getIdToken()).then((token) => entregar({ token: token ?? "" }));
    },
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => {
    // Tras una caída, el servidor ya no sabe en qué salas estábamos: se vuelve a entrar.
    if (habiaConectado) unidas.forEach((roomId) => void emitir(socket, "unirse", { roomId }).catch(() => undefined));
    habiaConectado = true;
    cambiarEstado("conectado");
  });
  socket.on("disconnect", (motivo) => {
    cambiarEstado(motivo === "io client disconnect" ? "sin-conexion" : "reconectando");
  });
  socket.on("connect_error", () => cambiarEstado(habiaConectado ? "reconectando" : "sin-conexion"));
  socket.io.on("reconnect_attempt", () => cambiarEstado("reconectando"));

  socket.on("mensaje", (mensaje: Mensaje) => mensajes.avisar(mensaje));
  socket.on("presencia", (datos: { personas?: Persona[] }) => presencia.avisar(datos.personas ?? []));
  socket.on("sala-eliminada", () => eliminada.avisar());
  socket.on("sala-actualizada", (datos: { nombre?: string }) => {
    if (typeof datos?.nombre === "string") actualizada.avisar(datos.nombre);
  });

  return {
    async unirse(roomId) {
      await emitir(socket, "unirse", { roomId });
      unidas.add(roomId);
    },
    enviar: (roomId, texto) => emitir(socket, "mensaje", { roomId, texto }),
    salir(roomId) {
      unidas.delete(roomId);
      if (socket.connected) socket.emit("salir", { roomId });
    },
    alMensaje: mensajes.agregar,
    alPresencia: presencia.agregar,
    alSalaEliminada: (oyente) => eliminada.agregar(() => oyente()),
    alSalaActualizada: actualizada.agregar,
    alEstado(oyente) {
      oyente(ultimoEstado); // quien se suscribe sabe el estado de inmediato
      return estados.agregar(oyente);
    },
    cerrar() {
      unidas.clear();
      socket.disconnect();
    },
  };
}

// Crea la conexión con el servidor de tiempo real. Con VITE_USE_MOCKS=true usa un servidor simulado
// en el navegador (src/mocks/tiempoReal.ts) para poder probar sin backend.
export async function conectarTiempoReal(): Promise<ClienteSala> {
  if (USAR_MOCKS) {
    const { crearClienteMock } = await import("./mocks/tiempoReal");
    return crearClienteMock();
  }
  return crearClienteReal();
}
