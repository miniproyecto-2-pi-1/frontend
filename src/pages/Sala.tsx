import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { EstadoConexionSala } from "../components/EstadoConexionSala";
import { MenuAcciones } from "../components/MenuAcciones";
import { ThemeToggle } from "../components/ThemeToggle";
import { AvisoSalaEliminada } from "../components/sala/AvisoSalaEliminada";
import { AvisosSala } from "../components/sala/AvisosSala";
import { ListaPersonas } from "../components/sala/ListaPersonas";
import { ModalEditarSala } from "../components/sala/ModalEditarSala";
import { ModalEliminarSala } from "../components/sala/ModalEliminarSala";
import { PanelChat } from "../components/sala/PanelChat";
import { useHistorialSala } from "../hooks/useHistorialSala";
import { useMensajesSala } from "../hooks/useMensajesSala";
import { useSalaPersonas } from "../hooks/useSalaPersonas";
import { useSalaTiempoReal } from "../hooks/useSalaTiempoReal";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";
import type { SalaPropia } from "./MisSalas";

export function Sala() {
  const { id = "" } = useParams();
  const ubicacion = useLocation();
  const navegar = useNavigate();
  const { usuario } = useSesion();

  const creada = (ubicacion.state as { salaCreada?: boolean } | null)?.salaCreada === true;
  // El aviso «Sala creada» se ve 5 segundos y se va solo.
  const [mostrarCreada, setMostrarCreada] = useState(creada);
  useEffect(() => {
    if (!creada) return;
    const temporizador = setTimeout(() => setMostrarCreada(false), 5000);
    return () => clearTimeout(temporizador);
  }, [creada]);

  const [sala, setSala] = useState<SalaPropia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [intento, setIntento] = useState(0);
  // Acciones del anfitrión (US-07): editar el nombre de la sala.
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  // El anfitrión eliminó la sala mientras estabas dentro (evento «sala-eliminada»).
  const [eliminadaPorAnfitrion, setEliminadaPorAnfitrion] = useState(false);
  const iniciadorRef = useRef<HTMLButtonElement | null>(null);
  // La parte izquierda tiene dos pestañas: el chat y los participantes.
  const [pestana, setPestana] = useState<"chat" | "personas">("chat");
  // El panel de la derecha se pliega con su barra de iconos.
  const [panelVisible, setPanelVisible] = useState(true);
  const botonChat = useRef<HTMLButtonElement>(null);
  const botonPersonas = useRef<HTMLButtonElement>(null);

  // Pestañas con el teclado: flechas izquierda y derecha, Inicio y Fin cambian de pestaña y mueven el foco.
  function alPulsarPestana(evento: KeyboardEvent) {
    const claves = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!claves.includes(evento.key)) return;
    evento.preventDefault();
    const siguiente = evento.key === "Home" ? "chat" : evento.key === "End" ? "personas" : pestana === "chat" ? "personas" : "chat";
    setPestana(siguiente);
    (siguiente === "chat" ? botonChat : botonPersonas).current?.focus();
  }

  useTitulo(sala?.nombre ?? "Sala");

  // Con la sala cargada se abre el tiempo real y se entra a ella con su ID oficial (US-08).
  const tiempoReal = useSalaTiempoReal(sala?.id ?? "", sala !== null);
  // Mensajes del chat (US-10).
  const { mensajes, fusionar } = useMensajesSala(tiempoReal.cliente);
  // Historial: los últimos mensajes guardados se piden al entrar a la sala (US-11).
  const historial = useHistorialSala(sala?.id ?? "", tiempoReal.unida, fusionar);
  // Personas conectadas y avisos de quién entra o sale (US-10).
  const miUid = usuario?.uid ?? "";
  const { personas: conectadas, avisos } = useSalaPersonas(tiempoReal.cliente, miUid);
  // Tú siempre apareces en la lista de participantes, aunque el servidor todavía no haya enviado la lista.
  const personas =
    !usuario || conectadas.some((p) => p.uid === miUid)
      ? conectadas
      : [{ uid: usuario.uid, username: usuario.username, avatar: usuario.avatar }, ...conectadas];

  // Cambios que hace el anfitrión con la sala abierta: nuevo nombre o eliminación (US-07).
  useEffect(() => {
    const cliente = tiempoReal.cliente;
    if (!cliente) return;
    const quitarEliminada = cliente.alSalaEliminada(() => {
      setEditando(false);
      setEliminando(false);
      setEliminadaPorAnfitrion(true);
    });
    const quitarActualizada = cliente.alSalaActualizada((nombre) => {
      setSala((actual) => (actual ? { ...actual, nombre } : actual));
      setMensaje(`El anfitrión cambió el nombre de la sala a «${nombre}»`);
    });
    return () => {
      quitarEliminada();
      quitarActualizada();
    };
  }, [tiempoReal.cliente]);

  useEffect(() => {
    const control = new AbortController();

    setCargando(true);
    setError("");

    apiFetch<SalaPropia>(`/api/v1/rooms/${encodeURIComponent(id)}`, { signal: control.signal })
      .then(setSala)
      .catch((e: unknown) => {
        if (control.signal.aborted) return;

        if (e instanceof ApiError && (e.code === "ROOM_NOT_FOUND" || e.status === 404)) {
          setError("Sala no encontrada. Revisa el ID.");
        } else {
          setError("No pudimos cargar la sala. Revisa tu conexión e inténtalo de nuevo.");
        }
      })
      .finally(() => {
        if (!control.signal.aborted) setCargando(false);
      });

    return () => control.abort();
  }, [id, intento]);

  async function copiar() {
    const idSala = sala?.id ?? id;
    try {
      await navigator.clipboard.writeText(idSala);
      setMensaje(`ID copiado: ${idSala}`);
    } catch {
      setMensaje("No pudimos copiar el ID. Inténtalo de nuevo.");
    }
  }

  const ICONO_ATRAS = (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );

  // Mensajes que ocupan el centro de la pantalla (cargando, errores, entrando).
  const centro = (contenido: ReactNode) => <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-4">{contenido}</div>;

  return (
    // La sala ocupa toda la pantalla (ancho y alto) y se adapta: en pantallas anchas va el recuadro del video
    // a la izquierda y el panel pegado al borde derecho; en pantallas angostas el panel ocupa todo.
    <main id="contenido" tabIndex={-1} className="flex h-dvh min-h-0 flex-col bg-fondo focus:outline-none">
      {/* Franja decorativa con los colores del prototipo, igual que en Mis salas. */}

      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 sm:px-4">
        <Link to="/salas" aria-label="Volver a Mis salas" className="inline-flex size-11 items-center justify-center rounded-lg text-texto hover:bg-superficie">
          {ICONO_ATRAS}
        </Link>

        {sala ? (
          <>
            <h1 className="text-2xl font-bold text-enlace">{sala.nombre}</h1>

            {sala.esAdministrador !== false && (
              <MenuAcciones
                etiqueta={`Más acciones de la sala ${sala.nombre}`}
                acciones={[
                  {
                    texto: "Editar sala",
                    icono: "editar",
                    alElegir: (boton) => {
                      iniciadorRef.current = boton;
                      setEditando(true);
                    },
                  },
                  {
                    texto: "Eliminar sala",
                    icono: "eliminar",
                    peligro: true,
                    alElegir: (boton) => {
                      iniciadorRef.current = boton;
                      setEliminando(true);
                    },
                  },
                ]}
              />
            )}

            <EstadoConexionSala estado={tiempoReal.estado} unida={tiempoReal.unida} />

            <span className="flex items-center gap-1">
              <span className="rounded-md border border-borde px-2 py-0.5 font-mono text-xs tracking-wide">{sala.id}</span>
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1 px-1 text-sm font-semibold text-enlace no-underline transition-colors hover:text-[#2563eb] dark:hover:text-[#7aa7ff]"
                aria-label={`Copiar ID de la sala ${sala.nombre}`}
                onClick={() => void copiar()}
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                </svg>
                Copiar ID
              </button>
            </span>
          </>
        ) : (
          <h1 className="text-2xl font-bold">Sala</h1>
        )}

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* La misma franja de color separa el encabezado del resto de la pantalla. */}

      {mensaje && (
        <div className="space-y-2 px-3 pt-2 sm:px-4">
          {mensaje && (
            <p role="status" aria-live="polite" className="rounded-lg bg-exito-fondo p-3 text-exito">
              ✓ {mensaje}
            </p>
          )}
        </div>
      )}

      {cargando ? (
        centro(
          <p role="status" className="tarjeta w-full max-w-md">
            Conectando… Cargando tu sala…
          </p>,
        )
      ) : error ? (
        centro(
          <div role="alert" className="w-full max-w-md">
            <p className="mb-4 rounded-lg bg-error-fondo p-4 font-medium text-error">{error}</p>

            <button type="button" className="btn-secundario" onClick={() => setIntento((i) => i + 1)}>
              Reintentar
            </button>
          </div>,
        )
      ) : sala ? (
        tiempoReal.errorUnirse ? (
          centro(
            <div role="alert" className="w-full max-w-md">
              <p className="mb-4 rounded-lg bg-error-fondo p-4 font-medium text-error">{tiempoReal.errorUnirse}</p>

              <button type="button" className="btn-secundario" onClick={tiempoReal.reintentar}>
                Reintentar
              </button>
            </div>,
          )
        ) : !tiempoReal.unida ? (
          centro(
            <p role="status" className="tarjeta w-full max-w-md">
              Entrando a la sala…
            </p>,
          )
        ) : (
          <>
            <AvisosSala avisos={avisos} />

            <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
              {/* «Sala creada»: se ve dentro del lado izquierdo, sobre el recuadro, y se va a los 5 segundos. */}
              <div role="status" className="pointer-events-none absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] lg:max-w-md">
                {creada && (
                  <p
                    className={`rounded-lg bg-exito-fondo px-4 py-3 font-medium text-exito shadow transition-opacity duration-500 ${
                      mostrarCreada ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {mostrarCreada ? "✓ Sala creada. Eres su anfitrión." : ""}
                  </p>
                )}
              </div>

              {/* Zona de los cuadros de video y sus botones. Por ahora solo se ve el recuadro y el botón de salir:
                  el video, el micrófono, la cámara y compartir pantalla llegan en el Sprint 4. */}
              <div className="hidden min-h-0 min-w-0 flex-1 flex-col p-4 lg:flex">
                <div aria-hidden="true" className="min-h-0 flex-1 rounded-xl border border-borde bg-superficie" />

                <div className="mt-4 flex shrink-0 flex-wrap items-start justify-center gap-6">
                  {(
                    [
                      ["Micrófono", <path key="m" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3" />],
                      ["Cámara", <path key="c" d="M3 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3ZM15 11l6-3v8l-6-3" />],
                      ["Compartir pantalla", <path key="p" d="M3 5h18v11H3ZM8 20h8M12 16v4" />],
                    ] as const
                  ).map(([nombre, icono]) => (
                    <button key={nombre} type="button" disabled className="flex flex-col items-center gap-1 text-sm text-suave opacity-60">
                      <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full border-[1.5px] border-campo">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          {icono}
                        </svg>
                      </span>
                      {nombre}
                    </button>
                  ))}

                  <Link to="/salas" className="flex flex-col items-center gap-1 text-sm font-semibold text-texto no-underline">
                    <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-[#b3261e] text-white">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </span>
                    Salir de la sala
                  </Link>
                </div>
              </div>

              {/* Panel pegado al borde derecho: dos pestañas, Chat y Participantes. Las dos quedan en la página para no perder el chat. */}
              <section
                id="panel-sala"
                aria-label="Chat y participantes"
                className={`flex min-h-0 flex-col overflow-hidden bg-superficie transition-[width,visibility] duration-300 ease-in-out lg:flex-none ${
                  panelVisible ? "visible flex-1 border-t border-borde lg:w-[26rem] lg:border-l lg:border-t-0" : "invisible max-lg:hidden lg:w-0"
                }`}
              >
                {/* El contenido conserva su ancho y se desliza: entra tirando hacia la izquierda y sale hacia la derecha. */}
                <div
                  className={`flex min-h-0 flex-1 flex-col transition-transform duration-300 ease-in-out lg:w-[26rem] ${
                    panelVisible ? "translate-x-0" : "lg:translate-x-full"
                  }`}
                >
                <div role="tablist" aria-label="Chat y participantes" onKeyDown={alPulsarPestana} className="flex shrink-0 border-b border-borde">
                  {(
                    [
                      ["chat", "Chat", botonChat],
                      ["personas", `Participantes (${personas.length})`, botonPersonas],
                    ] as const
                  ).map(([clave, texto, ref]) => (
                    <button
                      key={clave}
                      ref={ref}
                      type="button"
                      role="tab"
                      id={`pestana-${clave}`}
                      aria-selected={pestana === clave}
                      aria-controls={`panel-${clave}`}
                      tabIndex={pestana === clave ? 0 : -1}
                      onClick={() => setPestana(clave)}
                      className={`min-h-12 flex-1 border-b-[3px] px-4 font-bold transition-colors duration-300 ${
                        pestana === clave ? "border-principal text-texto" : "border-transparent text-suave hover:text-texto"
                      }`}
                    >
                      {texto}
                    </button>
                  ))}
                </div>

                {/* Las dos secciones quedan una sobre otra: al cambiar, la que sale se desvanece y se desliza y la que entra aparece. */}
                <div className="relative min-h-0 flex-1 overflow-hidden">
                <div
                  role="tabpanel"
                  id="panel-chat"
                  aria-labelledby="pestana-chat"
                  className={`absolute inset-0 flex flex-col transition-[opacity,transform,visibility] duration-300 ease-in-out ${
                    pestana === "chat" ? "visible translate-x-0 opacity-100" : "invisible -translate-x-6 opacity-0"
                  }`}
                >
                  {tiempoReal.cliente && (
                    <PanelChat
                      cliente={tiempoReal.cliente}
                      roomId={sala.id}
                      estado={tiempoReal.estado}
                      mensajes={mensajes}
                      historial={historial}
                      personas={personas}
                      miUid={miUid}
                    />
                  )}
                </div>

                <div
                  role="tabpanel"
                  id="panel-personas"
                  aria-labelledby="pestana-personas"
                  className={`absolute inset-0 overflow-y-auto p-4 transition-[opacity,transform,visibility] duration-300 ease-in-out ${
                    pestana === "personas" ? "visible translate-x-0 opacity-100" : "invisible translate-x-6 opacity-0"
                  }`}
                >
                  <ListaPersonas personas={personas} miUid={miUid} anfitrionUid={sala?.esAdministrador === true ? miUid : sala?.anfitrionUid} />
                </div>
                </div>
                </div>
              </section>

              {/* Barra de iconos pegada al borde: ocultar o mostrar el panel y abrir directamente Participantes o Chat. */}
              <div
                role="toolbar"
                aria-label="Panel de la sala"
                className="order-first flex shrink-0 gap-2 border-b border-borde bg-principal-suave p-2 lg:order-none lg:w-16 lg:flex-col lg:items-center lg:border-b-0 lg:border-l"
              >
                <button
                  type="button"
                  aria-label={panelVisible ? "Ocultar panel" : "Mostrar panel"}
                  aria-expanded={panelVisible}
                  aria-controls="panel-sala"
                  onClick={() => setPanelVisible((v) => !v)}
                  className="inline-flex size-11 items-center justify-center rounded-lg border-[1.5px] border-enlace text-enlace hover:bg-superficie"
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M15 4v16" />
                  </svg>
                </button>

                {(
                  [
                    ["chat", "Chat"],
                    ["personas", "Participantes"],
                  ] as const
                ).map(([clave, nombre]) => {
                  const activo = panelVisible && pestana === clave;
                  return (
                    <button
                      key={clave}
                      type="button"
                      aria-label={nombre}
                      aria-pressed={activo}
                      onClick={() => {
                        setPestana(clave);
                        setPanelVisible(true);
                      }}
                      className={`inline-flex size-11 items-center justify-center rounded-lg text-enlace hover:bg-superficie ${activo ? "bg-superficie" : ""}`}
                    >
                      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {clave === "personas" ? (
                          <>
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                          </>
                        ) : (
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                        )}
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )
      ) : null}

      {/* Y la misma franja cierra la pantalla por abajo. */}

      {sala && (
        <>
          {eliminadaPorAnfitrion && (
            <AvisoSalaEliminada nombre={sala.nombre} alIrAMisSalas={() => navegar("/salas", { replace: true })} />
          )}

          {eliminando && (
            <ModalEliminarSala
              sala={sala}
              iniciadorRef={iniciadorRef}
              alCerrar={() => setEliminando(false)}
              alEliminada={() => navegar("/salas", { replace: true, state: { aviso: `Sala «${sala.nombre}» eliminada` } })}
            />
          )}

          {editando && (
            <ModalEditarSala
              sala={sala}
              iniciadorRef={iniciadorRef}
              alCerrar={() => setEditando(false)}
              alGuardada={(actualizada) => {
                setSala((actual) => (actual ? { ...actual, nombre: actualizada.nombre } : actual));
                setMensaje(`Sala actualizada: «${actualizada.nombre}»`);
                setEditando(false);
              }}
            />
          )}
        </>
      )}
    </main>
  );
}
