import { useCallback, useEffect, useState } from "react";
import { conectarTiempoReal, ERROR_GENERAL, type ClienteSala, type EstadoConexion } from "../tiempoReal";

export interface SalaTiempoReal {
  // Conexión con el servidor de tiempo real; null mientras se abre.
  cliente: ClienteSala | null;
  estado: EstadoConexion;
  // true cuando el servidor ya aceptó la entrada a la sala.
  unida: boolean;
  // Mensaje listo para mostrar si no se pudo entrar a la sala (por ejemplo, «Sala no encontrada»).
  errorUnirse: string;
  reintentar: () => void;
}

// Abre la conexión de tiempo real, entra a la sala y la cierra al salir de la pantalla (US-08).
// habilitado = false mientras todavía no se sabe el ID real de la sala.
export function useSalaTiempoReal(roomId: string, habilitado: boolean): SalaTiempoReal {
  const [cliente, setCliente] = useState<ClienteSala | null>(null);
  const [estado, setEstado] = useState<EstadoConexion>("conectando");
  const [unida, setUnida] = useState(false);
  const [errorUnirse, setErrorUnirse] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!habilitado || !roomId) return;

    let cancelado = false;
    let abierto: ClienteSala | null = null;
    let quitarEstado: (() => void) | null = null;

    setUnida(false);
    setErrorUnirse("");
    setEstado("conectando");

    void conectarTiempoReal().then(async (nuevo) => {
      if (cancelado) {
        nuevo.cerrar();
        return;
      }
      abierto = nuevo;
      setCliente(nuevo);
      quitarEstado = nuevo.alEstado(setEstado);
      try {
        // unirse espera a que el socket conecte antes de enviar el evento.
        await nuevo.unirse(roomId);
        if (!cancelado) setUnida(true);
      } catch (error) {
        if (!cancelado) setErrorUnirse(error instanceof Error ? error.message : ERROR_GENERAL);
      }
    });

    return () => {
      cancelado = true;
      quitarEstado?.();
      if (abierto) {
        abierto.salir(roomId);
        abierto.cerrar();
      }
      setCliente(null);
    };
  }, [roomId, habilitado, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { cliente, estado, unida, errorUnirse, reintentar };
}
