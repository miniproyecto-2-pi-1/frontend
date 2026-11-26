import { useEffect, useState } from "react";
import type { ClienteSala } from "../tiempoReal";
import type { Mensaje } from "../tipos";

// Mensajes de la sala, en orden. Los nuevos llegan por el tiempo real (evento «mensaje»).
// Si un mensaje llega dos veces (por ejemplo, tras reconectar), solo se guarda una.
export function useMensajesSala(cliente: ClienteSala | null) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  useEffect(() => {
    setMensajes([]);
    if (!cliente) return;
    return cliente.alMensaje((nuevo) => {
      setMensajes((actuales) => (actuales.some((m) => m.id === nuevo.id) ? actuales : [...actuales, nuevo]));
    });
  }, [cliente]);

  return { mensajes, setMensajes };
}
