import { useCallback, useEffect, useState } from "react";
import type { ClienteSala } from "../tiempoReal";
import type { Mensaje } from "../tipos";

function ordenar(lista: Mensaje[]): Mensaje[] {
  return [...lista].sort((a, b) => a.creadoEn.localeCompare(b.creadoEn) || a.id.localeCompare(b.id));
}

// Mensajes de la sala, del más viejo al más nuevo. Los nuevos llegan por el tiempo real (evento «mensaje»)
// y los anteriores se agregan con fusionar() (historial). Si un mensaje llega dos veces, solo se guarda una.
export function useMensajesSala(cliente: ClienteSala | null) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  const fusionar = useCallback((lista: Mensaje[]) => {
    setMensajes((actuales) => {
      const ids = new Set(actuales.map((m) => m.id));
      const nuevos = lista.filter((m) => !ids.has(m.id));
      return nuevos.length > 0 ? ordenar([...actuales, ...nuevos]) : actuales;
    });
  }, []);

  useEffect(() => {
    setMensajes([]);
    if (!cliente) return;
    return cliente.alMensaje((nuevo) => fusionar([nuevo]));
  }, [cliente, fusionar]);

  return { mensajes, fusionar };
}
