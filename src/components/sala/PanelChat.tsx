import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Avatar } from "../Avatar";
import type { ClienteSala, EstadoConexion } from "../../tiempoReal";
import { MAXIMO_MENSAJE, type Mensaje, type Persona } from "../../tipos";
import { horaCorta } from "../../utils/hora";

interface Props {
  cliente: ClienteSala;
  roomId: string;
  estado: EstadoConexion;
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

export function PanelChat({ cliente, roomId, estado, mensajes, personas, miUid }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const escritura = useRef<HTMLTextAreaElement>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  const sinConexion = estado !== "conectado";
  // Un mensaje vacío o de solo espacios no se envía.
  const vacio = texto.trim().length === 0;

  async function enviar(evento?: FormEvent) {
    evento?.preventDefault();
    if (vacio || enviando || sinConexion) return;

    const aEnviar = texto.trim();
    setEnviando(true);
    setErrorEnvio("");
    setTexto(""); // el campo queda libre enseguida; si algo falla, el texto vuelve
    try {
      await cliente.enviar(roomId, aEnviar);
    } catch (error) {
      // Se devuelve el texto para poder reintentar, salvo que ya haya escrito otra cosa.
      setTexto((actual) => (actual ? actual : aEnviar));
      setErrorEnvio(error instanceof Error ? error.message : "No pudimos enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
      escritura.current?.focus();
    }
  }

  // Enter envía; Mayús + Enter hace un salto de línea.
  function alPulsar(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey && !evento.nativeEvent.isComposing) {
      evento.preventDefault();
      void enviar();
    }
  }

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

      <form noValidate onSubmit={(e) => void enviar(e)} className="border-t border-borde p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={escritura}
            rows={1}
            maxLength={MAXIMO_MENSAJE}
            aria-label="Escribe un mensaje"
            placeholder="Escribe un mensaje"
            className="campo max-h-32 min-h-11 flex-1 resize-none [field-sizing:content]"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setErrorEnvio("");
            }}
            onKeyDown={alPulsar}
          />

          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={vacio || enviando || sinConexion}
            className="btn-principal size-11 shrink-0 rounded-full !p-0 disabled:cursor-not-allowed disabled:border-borde disabled:bg-superficie disabled:text-suave"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2l-7 20-4-9-9-4Z" />
            </svg>
          </button>
        </div>

        <p className="mt-1 text-xs text-suave">
          {sinConexion ? "Sin conexión con la sala: no se pueden enviar mensajes." : "Enter envía · Mayús + Enter hace un salto de línea"}
          {texto.length >= MAXIMO_MENSAJE * 0.9 && ` · ${texto.length}/${MAXIMO_MENSAJE}`}
        </p>

        {errorEnvio && (
          <p role="alert" className="mt-2 rounded-lg bg-error-fondo p-2 text-sm font-medium text-error">
            {errorEnvio}
          </p>
        )}
      </form>
    </div>
  );
}
