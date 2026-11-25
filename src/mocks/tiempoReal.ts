import type { ClienteSala, EstadoConexion } from "../tiempoReal";
import { MAXIMO_MENSAJE, type Mensaje, type Persona } from "../tipos";
import { existeSala, guardarMensaje } from "./salas";
import { USUARIO_MOCK } from "./usuario";

// Servidor de tiempo real SIMULADO en el navegador (VITE_USE_MOCKS=true). Hace lo mismo que backend-realtime:
// «unirse» valida la sala, «mensaje» se guarda y se devuelve a quienes están en la sala, y «presencia» lista a las personas.
//
// Para probar lo que llega «desde afuera» hay ganchos en la consola del navegador (window.salonMock):
//   salonMock.mensaje("Hola", "Juan")   → llega un mensaje de otra persona.
//   salonMock.entra("Ana")  / salonMock.sale("Ana")  → una persona entra o sale de la sala.
//   salonMock.renombrar("Nuevo nombre") → el anfitrión cambió el nombre.
//   salonMock.eliminarSala()            → el anfitrión eliminó la sala.
//   salonMock.estado("reconectando")    → «conectado», «reconectando» o «sin-conexion».

const DEMORA_MS = 350;

const YO: Persona = { uid: USUARIO_MOCK.uid, username: USUARIO_MOCK.username, avatar: USUARIO_MOCK.avatar };
const OTRAS: Persona[] = [
  { uid: "mock-juan", username: "Juan", avatar: 1 },
  { uid: "mock-maria", username: "María", avatar: 2 },
  { uid: "mock-pablo", username: "Pablo", avatar: 3 },
];

interface GanchosMock {
  mensaje: (texto: string, username?: string) => void;
  entra: (username: string) => void;
  sale: (username: string) => void;
  renombrar: (nombre: string) => void;
  eliminarSala: () => void;
  estado: (estado: EstadoConexion) => void;
}

declare global {
  interface Window {
    salonMock?: GanchosMock;
  }
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

export function crearClienteMock(): ClienteSala {
  const mensajes = new Set<(m: Mensaje) => void>();
  const presencia = new Set<(p: Persona[]) => void>();
  const eliminada = new Set<() => void>();
  const actualizada = new Set<(nombre: string) => void>();
  const estados = new Set<(e: EstadoConexion) => void>();
  let ultimoEstado: EstadoConexion = "conectando";
  let sala = "";
  let otras = [...OTRAS];

  const cambiarEstado = (estado: EstadoConexion) => {
    ultimoEstado = estado;
    estados.forEach((oyente) => oyente(estado));
  };
  const avisarPresencia = () => presencia.forEach((oyente) => oyente([YO, ...otras]));
  const nuevoId = () => `mock-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  setTimeout(() => cambiarEstado("conectado"), 300);

  const recibir = (texto: string, persona: Persona) => {
    const mensaje: Mensaje = { id: nuevoId(), uid: persona.uid, username: persona.username, texto, creadoEn: new Date().toISOString() };
    if (sala) guardarMensaje(sala, mensaje);
    mensajes.forEach((oyente) => oyente(mensaje));
  };

  window.salonMock = {
    mensaje: (texto, username = "Juan") =>
      recibir(texto, otras.find((p) => p.username === username) ?? { uid: `mock-${username}`, username, avatar: 4 }),
    entra: (username) => {
      if (!otras.some((p) => p.username === username)) otras = [...otras, { uid: `mock-${username}`, username, avatar: 4 }];
      avisarPresencia();
    },
    sale: (username) => {
      otras = otras.filter((p) => p.username !== username);
      avisarPresencia();
    },
    renombrar: (nombre) => actualizada.forEach((oyente) => oyente(nombre)),
    eliminarSala: () => eliminada.forEach((oyente) => oyente()),
    estado: cambiarEstado,
  };

  return {
    async unirse(roomId) {
      await esperar(DEMORA_MS);
      if (ultimoEstado === "sin-conexion") throw new Error("No hay conexión con la sala. Revisa tu internet e inténtalo de nuevo.");
      if (!existeSala(roomId)) throw new Error("Sala no encontrada. Revisa el ID.");
      sala = roomId.trim().toUpperCase();
      avisarPresencia();
    },
    async enviar(roomId, texto) {
      await esperar(150);
      const limpio = texto.trim();
      if (!sala || roomId.trim().toUpperCase() !== sala) throw new Error("Primero únete a la sala.");
      if (ultimoEstado !== "conectado") throw new Error("No hay conexión con la sala. Revisa tu internet e inténtalo de nuevo.");
      if (!limpio) throw new Error("Escribe un mensaje.");
      if (limpio.length > MAXIMO_MENSAJE) throw new Error(`El mensaje es muy largo (máximo ${MAXIMO_MENSAJE} caracteres).`);
      recibir(limpio, YO);
    },
    salir() {
      sala = "";
    },
    alMensaje(oyente) {
      mensajes.add(oyente);
      return () => void mensajes.delete(oyente);
    },
    alPresencia(oyente) {
      presencia.add(oyente);
      return () => void presencia.delete(oyente);
    },
    alSalaEliminada(oyente) {
      eliminada.add(oyente);
      return () => void eliminada.delete(oyente);
    },
    alSalaActualizada(oyente) {
      actualizada.add(oyente);
      return () => void actualizada.delete(oyente);
    },
    alEstado(oyente) {
      oyente(ultimoEstado);
      estados.add(oyente);
      return () => void estados.delete(oyente);
    },
    cerrar() {
      sala = "";
      delete window.salonMock;
    },
  };
}
