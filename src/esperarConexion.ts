import type { Socket } from "socket.io-client";

// Espera a que la conexión con el servidor de tiempo real esté abierta antes de entrar a una sala.
// Sin esta espera, entrar a la sala se intentaba antes de que el navegador terminara de conectarse y siempre fallaba.
//
// - Si la conexión ya está abierta, sigue de inmediato.
// - Si el servidor rechaza la conexión de forma definitiva (por ejemplo, el token de sesión no sirve), falla enseguida
//   con el motivo que mandó el servidor.
// - Si es un fallo de red, Socket.IO reintenta solo: se sigue esperando hasta que se acabe el tiempo.
export function esperarConexion(socket: Socket, espera: number, mensajeSinConexion: string): Promise<void> {
  if (socket.connected) return Promise.resolve();

  return new Promise<void>((resolver, rechazar) => {
    const terminar = () => {
      clearTimeout(temporizador);
      socket.off("connect", alConectar);
      socket.off("connect_error", alFallar);
    };
    const alConectar = () => {
      terminar();
      resolver();
    };
    const alFallar = (error: Error) => {
      // «active» es true mientras Socket.IO va a reintentar solo (fallo de red); false si el servidor rechazó la conexión.
      if (socket.active) return;
      terminar();
      rechazar(new Error(error.message || mensajeSinConexion));
    };
    const temporizador = setTimeout(() => {
      terminar();
      rechazar(new Error(mensajeSinConexion));
    }, espera);

    socket.on("connect", alConectar);
    socket.on("connect_error", alFallar);
  });
}
