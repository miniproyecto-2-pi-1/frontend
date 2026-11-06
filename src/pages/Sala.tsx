import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { leerSalas, type Sala as SalaDatos } from "../data/salas";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";

interface Mensaje {
  autor: string;
  hora: string;
  texto: string;
}

const MENSAJES_INICIALES: Mensaje[] = [
  { autor: "Juan Pérez", hora: "ayer 21:40", texto: "Mañana repasamos integrales a las 4." },
  { autor: "María López", hora: "ayer 21:42", texto: "Perfecto. Yo llevo los ejercicios." },
];

const OTRAS_PERSONAS = [
  { nombre: "Juan Pérez", estado: "cámara encendida", color: 1 },
  { nombre: "María López", estado: "sin micrófono", color: 2 },
  { nombre: "Pablo Ruiz", estado: "presentando pantalla", color: 3 },
];

// Sala (demostración del Sprint 0): cuadrícula, controles, personas y chat con datos de ejemplo.
// El video, el audio y la pantalla compartida llegan en los sprints 4 y 5; el chat en tiempo real, en el 3.
export function Sala() {
  const { id } = useParams();
  const sala = leerSalas().find((s) => s.id === id);
  useTitulo(sala ? sala.nombre : "Sala no encontrada");

  if (!sala) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
        <h1 className="mb-3 text-3xl font-bold">Sala no encontrada</h1>
        <p className="mb-6 text-suave">La sala no existe o ya no está disponible. Revisa el ID e inténtalo de nuevo.</p>
        <Link to="/salas" className="btn-principal">
          Ir a Mis salas
        </Link>
      </section>
    );
  }
  return <SalaAbierta sala={sala} />;
}

function SalaAbierta({ sala }: { sala: SalaDatos }) {
  const { usuario } = useSesion();
  const navegar = useNavigate();
  const nombreUsuario = usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : "Tú";

  // Micrófono y cámara empiezan apagados (US-12).
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [presentando, setPresentando] = useState(false);
  const [panel, setPanel] = useState(true);
  const [anuncio, setAnuncio] = useState("");

  const [buscarPersona, setBuscarPersona] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>(MENSAJES_INICIALES);
  const [texto, setTexto] = useState("");
  const [chatBusqueda, setChatBusqueda] = useState(false);
  const [filtroChat, setFiltroChat] = useState("");
  const finChat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finChat.current?.scrollIntoView({ block: "nearest" });
  }, [mensajes]);

  const estadoUsuario = presentando
    ? "presentando pantalla"
    : `${mic ? "micrófono encendido" : "micrófono apagado"}, ${cam ? "cámara encendida" : "cámara apagada"}`;

  const personas = [{ nombre: `${nombreUsuario} (tú)`, estado: estadoUsuario, color: usuario?.avatar ?? 0 }, ...OTRAS_PERSONAS];
  const visibles = personas.filter((p) => p.nombre.toLowerCase().includes(buscarPersona.trim().toLowerCase()));
  const mensajesVisibles = mensajes.filter((m) => `${m.autor} ${m.texto}`.toLowerCase().includes(filtroChat.trim().toLowerCase()));

  function alternar(valor: boolean, poner: (v: boolean) => void, encendido: string, apagado: string) {
    poner(!valor);
    setAnuncio(!valor ? encendido : apagado);
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!texto.trim()) return; // un mensaje vacío no se envía (US-10)
    setMensajes((m) => [...m, { autor: usuario?.username ?? "Tú", hora: "ahora", texto: texto.trim() }]);
    setTexto("");
  }

  const botonControl = "inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] border-campo bg-fondo px-4 py-2 font-bold text-texto aria-pressed:border-enlace aria-pressed:bg-enlace aria-pressed:text-fondo";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{sala.nombre}</h1>
        <span className="inline-flex items-center gap-2 rounded-full bg-exito-fondo px-3 py-0.5 font-bold text-exito">
          <span aria-hidden="true" className="size-2 rounded-full bg-exito" />
          Conectado
        </span>
        <span className="text-suave">ID de sala: {sala.id}</span>
        <button
          type="button"
          className="btn-secundario ml-auto"
          aria-expanded={panel}
          aria-controls="panel-sala"
          onClick={() => setPanel((p) => !p)}
        >
          {panel ? "Ocultar panel" : "Mostrar panel"}
        </button>
      </div>

      <div className={`grid gap-4 ${panel ? "lg:grid-cols-[1fr_22rem]" : ""}`}>
        <section aria-label="Participantes de la sala">
          <ul className="grid gap-3 sm:grid-cols-2">
            {personas.map((p, i) => {
              const presenta = i === 0 ? presentando : p.estado === "presentando pantalla";
              return (
                <li
                  key={p.nombre}
                  className="relative flex min-h-44 items-center justify-center rounded-[10px] bg-superficie"
                  style={presenta ? { boxShadow: "inset 0 0 0 4px var(--enlace)" } : { border: "1px solid var(--borde)" }}
                >
                  <Avatar nombre={p.nombre.replace(" (tú)", "")} color={p.color} tam={64} />
                  <span className="absolute bottom-2 left-2 rounded-full bg-fondo px-3 py-0.5 text-sm">
                    {p.nombre} · {p.estado}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className={botonControl}
              aria-pressed={mic}
              onClick={() => alternar(mic, setMic, "Micrófono encendido", "Micrófono apagado")}
            >
              {mic ? "Micrófono encendido" : "Micrófono apagado"}
            </button>
            <button
              type="button"
              className={botonControl}
              aria-pressed={cam}
              onClick={() => alternar(cam, setCam, "Cámara encendida", "Cámara apagada")}
            >
              {cam ? "Cámara encendida" : "Cámara apagada"}
            </button>
            <button
              type="button"
              className={botonControl}
              aria-pressed={presentando}
              onClick={() => alternar(presentando, setPresentando, "Estás presentando tu pantalla", "Dejaste de presentar")}
            >
              {presentando ? "Dejar de compartir" : "Compartir pantalla"}
            </button>
            <button
              type="button"
              onClick={() => navegar("/salas")}
              className="inline-flex min-h-11 items-center rounded-lg px-4 py-2 font-bold"
              style={{ background: "var(--error)", color: "var(--fondo)" }}
            >
              Salir de la sala
            </button>
          </div>
          <p role="status" className="sr-only">
            {anuncio}
          </p>
        </section>

        {panel && (
          <aside id="panel-sala" aria-label="Personas y chat" className="flex flex-col gap-4">
            <section aria-labelledby="titulo-personas" className="tarjeta">
              <h2 id="titulo-personas" className="mb-2 text-lg font-bold">
                Personas <span className="font-normal text-suave">· {personas.length} en línea</span>
              </h2>
              <label htmlFor="buscar-persona" className="sr-only">
                Buscar participante
              </label>
              <input
                id="buscar-persona"
                type="search"
                className="campo mb-3"
                placeholder="Buscar participante"
                value={buscarPersona}
                onChange={(e) => setBuscarPersona(e.target.value)}
              />
              <ul className="flex flex-col gap-2">
                {visibles.map((p) => (
                  <li key={p.nombre} className="flex items-center gap-2">
                    <Avatar nombre={p.nombre.replace(" (tú)", "")} color={p.color} tam={32} />
                    <span className="flex-1">
                      <span className="block font-bold">{p.nombre}</span>
                      <span className="block text-sm text-suave">{p.estado}</span>
                    </span>
                    <span className="text-sm font-bold text-exito">● En línea</span>
                  </li>
                ))}
                {visibles.length === 0 && <li className="text-suave">No hay nadie con ese nombre en la sala.</li>}
              </ul>
            </section>

            <section aria-labelledby="titulo-chat" className="tarjeta flex flex-col">
              <div className="mb-2 flex items-center justify-between">
                <h2 id="titulo-chat" className="text-lg font-bold">
                  Chat
                </h2>
                <button
                  type="button"
                  className="text-enlace underline"
                  aria-expanded={chatBusqueda}
                  onClick={() => {
                    setChatBusqueda((b) => !b);
                    setFiltroChat("");
                  }}
                >
                  Buscar en el chat
                </button>
              </div>
              {chatBusqueda && (
                <>
                  <label htmlFor="buscar-chat" className="sr-only">
                    Buscar en el chat
                  </label>
                  <input
                    id="buscar-chat"
                    type="search"
                    className="campo mb-3"
                    placeholder="Buscar en el chat"
                    value={filtroChat}
                    onChange={(e) => setFiltroChat(e.target.value)}
                  />
                </>
              )}
              <div role="log" aria-live="polite" aria-label="Mensajes del chat" className="mb-3 max-h-64 overflow-y-auto">
                {mensajesVisibles.length === 0 && <p className="text-suave">No hay mensajes con ese texto.</p>}
                <ul className="flex flex-col gap-3">
                  {mensajesVisibles.map((m, i) => (
                    <li key={i}>
                      <p>
                        <span className="font-bold">{m.autor}</span> <span className="text-sm text-suave">{m.hora}</span>
                      </p>
                      <p>{m.texto}</p>
                    </li>
                  ))}
                </ul>
                <div ref={finChat} />
              </div>
              <form onSubmit={enviar} className="flex gap-2">
                <label htmlFor="mensaje" className="sr-only">
                  Escribe un mensaje
                </label>
                <input
                  id="mensaje"
                  className="campo"
                  placeholder="Escribe un mensaje"
                  autoComplete="off"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                />
                <button type="submit" className="btn-principal">
                  Enviar
                </button>
              </form>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
