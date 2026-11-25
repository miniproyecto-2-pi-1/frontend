import { useEffect, useRef, useState } from "react";
import type { ClienteSala } from "../tiempoReal";
import type { Persona } from "../tipos";

export interface AvisoPresencia {
  id: number;
  texto: string;
  tipo: "entra" | "sale";
}

const DURACION_AVISO_MS = 5000;

// Personas conectadas a la sala (evento «presencia») y avisos cuando alguien entra o sale.
// La primera lista que llega solo se muestra: no genera avisos. Tú no recibes avisos de ti.
export function useSalaPersonas(cliente: ClienteSala | null, miUid: string) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [avisos, setAvisos] = useState<AvisoPresencia[]>([]);
  const anteriores = useRef<Persona[] | null>(null);
  const contador = useRef(0);

  useEffect(() => {
    setPersonas([]);
    setAvisos([]);
    anteriores.current = null;
    if (!cliente) return;

    return cliente.alPresencia((lista) => {
      setPersonas(lista);
      const antes = anteriores.current;
      anteriores.current = lista;
      if (!antes) return;

      const nuevos: AvisoPresencia[] = [
        ...lista
          .filter((p) => p.uid !== miUid && !antes.some((a) => a.uid === p.uid))
          .map((p) => ({ id: ++contador.current, texto: `${p.username} entró a la sala`, tipo: "entra" as const })),
        ...antes
          .filter((a) => a.uid !== miUid && !lista.some((p) => p.uid === a.uid))
          .map((a) => ({ id: ++contador.current, texto: `${a.username} salió de la sala`, tipo: "sale" as const })),
      ];
      if (nuevos.length === 0) return;

      setAvisos((actuales) => [...actuales, ...nuevos]);
      for (const aviso of nuevos) {
        setTimeout(() => setAvisos((actuales) => actuales.filter((a) => a.id !== aviso.id)), DURACION_AVISO_MS);
      }
    });
  }, [cliente, miUid]);

  return { personas, avisos };
}
