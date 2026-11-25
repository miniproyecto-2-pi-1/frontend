import { useLayoutEffect, useRef } from "react";
import { Avatar } from "../Avatar";
import { horaCorta } from "../../utils/hora";
import type { Mensaje, Persona } from "../../tipos";

interface Props {
  mensajes: Mensaje[];
  personas: Persona[];
  // uid de la persona que está usando la pantalla: sus mensajes se distinguen.
  miUid: string;
}

// Un mismo color por persona: el del avatar que eligió, o uno estable sacado de su uid.
function colorDe(uid: string, personas: Persona[]): number {
  const persona = personas.find((p) => p.uid === uid);
  if (persona) return persona.avatar;
  let n = 0;
  for (const c of uid) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return n;
}

export function PanelChat({ mensajes, personas, miUid }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);

  // Al llegar mensajes, la lista baja hasta el último.
  useLayoutEffect(() => {
    const cont = contenedor.current;
    if (cont) cont.scrollTop = cont.scrollHeight;
  }, [mensajes]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={contenedor} className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul role="log" aria-label="Mensajes de la sala" aria-live="polite" aria-relevant="additions" className="space-y-4">
          {mensajes.map((m) => {
            const propio = m.uid === miUid;
            return (
              <li key={m.id} className={`flex gap-2 ${propio ? "flex-row-reverse" : ""}`}>
                <Avatar nombre={m.username} color={colorDe(m.uid, personas)} tam={32} />
                <div className={`min-w-0 max-w-[85%] ${propio ? "text-right" : ""}`}>
                  <p className="text-sm">
                    <strong>{propio ? "Tú" : m.username}</strong>{" "}
                    <time dateTime={m.creadoEn} className="text-suave">
                      {horaCorta(m.creadoEn)}
                    </time>
                  </p>
                  <p
                    className={`mt-0.5 inline-block whitespace-pre-wrap break-words rounded-xl px-3 py-2 text-left ${
                      propio ? "bg-principal text-white" : "bg-superficie"
                    }`}
                  >
                    {m.texto}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
