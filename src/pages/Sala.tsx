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

  // Los botones de chat y participantes abren el panel en esa pestaña; si ya está abierta, lo pliegan.
  function alternarPanel(clave: "chat" | "personas") {
    if (panelVisible && pestana === clave) {
      setPanelVisible(false);
    } else {
      setPestana(clave);
      setPanelVisible(true);
    }
  }

  const icono = (rutas: ReactNode, tam = 21) => (
    <svg aria-hidden="true" width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {rutas}
    </svg>
  );

  const claseBoton = "relative inline-flex size-12 shrink-0 items-center justify-center rounded-full transition-colors";

  // Barra de controles flotante: micrófono, cámara y compartir (llegan en el Sprint 4), chat, participantes y salir.
  const barraControles = (
    <div
      role="toolbar"
      aria-label="Controles de la sala"
      className="flex items-center gap-2.5 rounded-full bg-sala-tarjeta px-3.5 py-2.5 shadow-[0_10px_34px_rgba(80,50,160,0.2)] dark:shadow-[0_10px_34px_rgba(0,0,0,0.55)] dark:ring-1 dark:ring-white/10"
    >
      {(
        [
          ["Micrófono", <path key="m" d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3" />],
          ["Cámara", <path key="c" d="M3 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3ZM15 11l6-3v8l-6-3" />],
          ["Compartir pantalla", <path key="p" d="M3 5h18v11H3ZM8 20h8M12 16v4" />],
        ] as const
      ).map(([nombre, rutas]) => (
        <button key={nombre} type="button" disabled aria-label={`${nombre} (próximamente)`} title={`${nombre}: llega en el siguiente sprint`} className={`${claseBoton} bg-sala-campo text-texto opacity-60`}>
          {icono(rutas)}
        </button>
      ))}

      <span aria-hidden="true" className="h-7 w-px bg-borde" />

      {(["chat", "personas"] as const).map((clave) => {
        const activo = panelVisible && pestana === clave;
        const nombre = clave === "chat" ? "Chat" : `Participantes (${personas.length})`;
        return (
          <button
            key={clave}
            type="button"
            aria-label={nombre}
            title={nombre}
            aria-pressed={activo}
            aria-controls="panel-sala"
            onClick={() => alternarPanel(clave)}
            className={`${claseBoton} ${activo ? "bg-principal text-white" : "bg-sala-campo text-texto hover:bg-principal-suave"}`}
          >
            {clave === "chat" ? (
              icono(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />)
            ) : (
              icono(
                <>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </>,
              )
            )}
            {clave === "personas" && (
              <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full border-2 border-sala-tarjeta bg-[#dc2626] px-1 text-center text-[11px] font-bold leading-4 text-white">
                {personas.length}
              </span>
            )}
          </button>
        );
      })}

      <span aria-hidden="true" className="h-7 w-px bg-borde" />

      <Link to="/salas" aria-label="Salir de la sala" title="Salir de la sala" className={`${claseBoton} w-16 bg-[#dc2626] text-white no-underline hover:bg-[#b91c1c]`}>
        {icono(<path transform="rotate(135 12 12)" d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />, 23)}
      </Link>
    </div>
  );

  return (
    // La sala ocupa toda la pantalla: fondo lila suave con dos tarjetas flotantes, el video a la izquierda y el panel de
    // chat y participantes a la derecha, y la barra de controles flotando abajo. En pantallas angostas el panel ocupa todo.
    <main id="contenido" tabIndex={-1} className="flex h-dvh min-h-0 flex-col bg-sala-fondo focus:outline-none">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 sm:px-4">
        <Link to="/salas" aria-label="Volver a Mis salas" className="inline-flex size-11 items-center justify-center rounded-xl bg-sala-tarjeta text-texto shadow-sm hover:bg-principal-suave">
          {ICONO_ATRAS}
        </Link>

        {sala ? (
          <>
            <div className="flex items-center gap-1">
              <h1 className="text-2xl font-bold tracking-tight text-enlace">{sala.nombre}</h1>

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
            </div>

            <EstadoConexionSala estado={tiempoReal.estado} unida={tiempoReal.unida} />

            <span className="inline-flex items-center gap-2 rounded-full bg-sala-tarjeta py-1 pl-3.5 pr-1 text-xs font-semibold shadow-sm">
              <span className="font-mono tracking-wide">{sala.id}</span>
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-principal-suave px-3 text-xs font-bold text-enlace transition-colors hover:bg-principal hover:text-white"
                aria-label={`Copiar ID de la sala ${sala.nombre}`}
                onClick={() => void copiar()}
              >
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <ThemeToggle className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-sala-tarjeta text-texto shadow-sm hover:bg-principal-suave" />
        </div>
      </header>

      {mensaje && (
        <div className="space-y-2 px-3 pb-2 sm:px-4">
          <p role="status" aria-live="polite" className="rounded-xl bg-exito-fondo p-3 text-exito">
            ✓ {mensaje}
          </p>
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

            <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4 lg:flex-row">
              {/* «Sala creada»: se ve dentro del lado izquierdo, sobre la tarjeta, y se va a los 5 segundos. */}
              <div role="status" className="pointer-events-none absolute left-6 top-4 z-10 max-w-[calc(100%-3rem)] lg:max-w-md">
                {creada && (
                  <p
                    className={`rounded-xl bg-exito-fondo px-4 py-3 font-medium text-exito shadow transition-opacity duration-500 ${
                      mostrarCreada ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {mostrarCreada ? "✓ Sala creada. Eres su anfitrión." : ""}
                  </p>
                )}
              </div>

              {/* Tarjeta de los cuadros de video, con la barra de controles flotando abajo. Por ahora solo se ve la tarjeta:
                  el video, el micrófono, la cámara y compartir pantalla llegan en el Sprint 4. */}
              <div className="relative hidden min-h-0 min-w-0 flex-1 lg:flex">
                <div
                  aria-hidden="true"
                  className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[22px] bg-sala-tarjeta p-6 text-center text-sm text-suave shadow-[0_8px_30px_rgba(80,50,160,0.1)] dark:ring-1 dark:ring-white/5"
                >
                  <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,var(--principal-suave),transparent)] opacity-60" />
                  <span className="relative">Aquí irá la cuadrícula de participantes</span>
                </div>

                <div className="absolute inset-x-0 bottom-5 flex justify-center">{barraControles}</div>
              </div>

              {/* Panel flotante a la derecha: dos pestañas, Chat y Participantes. Se pliega con sus botones de la barra. */}
              <section
                id="panel-sala"
                aria-label="Chat y participantes"
                className={`flex min-h-0 flex-col overflow-hidden transition-[width,margin,padding,visibility] duration-300 ease-in-out lg:-my-3 lg:flex-none lg:py-3 ${
                  panelVisible ? "visible flex-1 lg:-mr-3 lg:ml-1 lg:w-[calc(26rem+1.5rem)] lg:px-3" : "invisible max-lg:hidden lg:w-0"
                }`}
              >
                {/* El contenido conserva su ancho y se desliza: entra tirando hacia la izquierda y sale hacia la derecha. */}
                <div
                  className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] bg-sala-tarjeta shadow-[0_8px_30px_rgba(80,50,160,0.1)] transition-transform duration-300 ease-in-out dark:ring-1 dark:ring-white/5 lg:w-[26rem] lg:flex-none lg:h-full ${
                    panelVisible ? "translate-x-0" : "lg:translate-x-full"
                  }`}
                >
                  <div role="tablist" aria-label="Chat y participantes" onKeyDown={alPulsarPestana} className="m-3.5 mb-1.5 flex shrink-0 gap-0.5 rounded-full bg-sala-campo p-1">
                    {(
                      [
                        ["chat", "Chat", botonChat],
                        ["personas", `Participantes · ${personas.length}`, botonPersonas],
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
                        className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition-colors duration-300 ${
                          pestana === clave ? "bg-principal text-white shadow-[0_2px_8px_rgba(109,63,224,0.35)]" : "text-suave hover:text-texto"
                        }`}
                      >
                        {clave === "personas" && <span aria-hidden="true" className="size-2 rounded-full bg-[#22c55e]" />}
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
                      className={`absolute inset-0 flex flex-col px-3.5 pb-3.5 pt-2 transition-[opacity,transform,visibility] duration-300 ease-in-out ${
                        pestana === "personas" ? "visible translate-x-0 opacity-100" : "invisible translate-x-6 opacity-0"
                      }`}
                    >
                      <ListaPersonas
                        personas={personas}
                        miUid={miUid}
                        anfitrionUid={sala?.esAdministrador === true ? miUid : sala?.anfitrionUid}
                        salaId={sala.id}
                        alCopiar={() => void copiar()}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* En pantallas angostas la barra de controles va debajo del panel. */}
              <div className="flex justify-center pt-3 lg:hidden">{barraControles}</div>
            </div>
          </>
        )
      ) : null}

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
