import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";
import type { Mensaje } from "../tipos";

export type EstadoHistorial = "cargando" | "listo" | "error";

interface RespuestaHistorial {
  mensajes: Mensaje[]; // del más viejo al más nuevo
  hayMas: boolean; // hay mensajes todavía más viejos
}

const POR_PAGINA = 50;
const ERROR_CARGA = "No pudimos cargar los mensajes. Revisa tu conexión e inténtalo de nuevo.";

// Historial del chat (US-11): al entrar a la sala se piden los últimos mensajes guardados.
// habilitado = true cuando ya se entró a la sala. fusionar() los pone en la lista, sin repetir los que ya llegaron en vivo.
export function useHistorialSala(roomId: string, habilitado: boolean, fusionar: (lista: Mensaje[]) => void) {
  const [estado, setEstado] = useState<EstadoHistorial>("cargando");
  const [hayMas, setHayMas] = useState(false);
  const [intento, setIntento] = useState(0);
  const masViejo = useRef<string | null>(null); // fecha del mensaje más viejo ya cargado del historial

  useEffect(() => {
    if (!habilitado || !roomId) return;
    const control = new AbortController();
    masViejo.current = null;
    setEstado("cargando");
    setHayMas(false);

    apiFetch<RespuestaHistorial>(`/api/v1/rooms/${encodeURIComponent(roomId)}/messages?limite=${POR_PAGINA}`, {
      signal: control.signal,
    })
      .then((respuesta) => {
        fusionar(respuesta.mensajes);
        masViejo.current = respuesta.mensajes[0]?.creadoEn ?? null;
        setHayMas(respuesta.hayMas);
        setEstado("listo");
      })
      .catch(() => {
        if (!control.signal.aborted) setEstado("error");
      });

    return () => control.abort();
  }, [roomId, habilitado, intento, fusionar]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  return { estado, hayMas, error: estado === "error" ? ERROR_CARGA : "", reintentar };
}
