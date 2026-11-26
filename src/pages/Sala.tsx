import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { EstadoConexionSala } from "../components/EstadoConexionSala";
import { MenuAcciones } from "../components/MenuAcciones";
import { AvisoSalaEliminada } from "../components/sala/AvisoSalaEliminada";
import { AvisosSala } from "../components/sala/AvisosSala";
import { ListaPersonas } from "../components/sala/ListaPersonas";
import { MosaicoPersonas } from "../components/sala/MosaicoPersonas";
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
  // En pantallas angostas se ve una sola cosa a la vez: el chat o las personas.
  const [vista, setVista] = useState<"chat" | "personas">("chat");

  useTitulo(sala?.nombre ?? "Sala");

  // Con la sala cargada se abre el tiempo real y se entra a ella con su ID oficial (US-08).
  const tiempoReal = useSalaTiempoReal(sala?.id ?? "", sala !== null);
  // Mensajes del chat (US-10).
  const { mensajes, fusionar } = useMensajesSala(tiempoReal.cliente);
  // Historial: los últimos mensajes guardados se piden al entrar a la sala (US-11).
  const historial = useHistorialSala(sala?.id ?? "", tiempoReal.unida, fusionar);
  // Personas conectadas y avisos de quién entra o sale (US-10).
  const miUid = usuario?.uid ?? "";
  const { personas, avisos } = useSalaPersonas(tiempoReal.cliente, miUid);

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

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link to="/salas" className="mb-4 inline-block font-semibold text-enlace underline">
        ← Mis salas
      </Link>

      {cargando ? (
        <p role="status" className="tarjeta">
          Conectando… Cargando tu sala…
        </p>
      ) : error ? (
        <div role="alert">
          <p className="mb-4 rounded-lg bg-error-fondo p-4 font-medium text-error">{error}</p>

          <button type="button" className="btn-secundario" onClick={() => setIntento((i) => i + 1)}>
            Reintentar
          </button>
        </div>
      ) : sala ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            <h1 className="text-3xl font-bold">{sala.nombre}</h1>

            <EstadoConexionSala estado={tiempoReal.estado} unida={tiempoReal.unida} />

            {sala.esAdministrador !== false ? (
              <span className="text-sm font-semibold text-[#2563eb] dark:text-[#7aa7ff]">Anfitrión</span>
            ) : (
              <span className="text-sm font-semibold text-suave">Invitado</span>
            )}

            <span className="flex items-center gap-1">
              <span className="rounded-md border border-borde px-2 py-0.5 font-mono text-sm tracking-wide">{sala.id}</span>
              <button
                type="button"
                className="min-h-11 px-2 font-semibold text-enlace underline"
                aria-label={`Copiar ID de la sala ${sala.nombre}`}
                onClick={() => void copiar()}
              >
                ▢ Copiar ID
              </button>
            </span>

            {sala.esAdministrador !== false && (
              <MenuAcciones
                className="ml-auto"
                contorno
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

          {creada && (
            <p role="status" className="mb-4 rounded-lg bg-exito-fondo p-3 text-exito">
              ✓ Sala creada. Eres su anfitrión.
            </p>
          )}

          {mensaje && (
            <p role="status" aria-live="polite" className="mb-4 rounded-lg bg-exito-fondo p-3 text-exito">
              ✓ {mensaje}
            </p>
          )}

          {tiempoReal.errorUnirse ? (
            <div role="alert">
              <p className="mb-4 rounded-lg bg-error-fondo p-4 font-medium text-error">{tiempoReal.errorUnirse}</p>

              <button type="button" className="btn-secundario" onClick={tiempoReal.reintentar}>
                Reintentar
              </button>
            </div>
          ) : !tiempoReal.unida ? (
            <p role="status" className="tarjeta">
              Entrando a la sala…
            </p>
          ) : (
            <>
              <AvisosSala avisos={avisos} />

              <div className="mb-3 flex gap-2 lg:hidden">
                <button type="button" className="btn-secundario flex-1" aria-pressed={vista === "chat"} onClick={() => setVista("chat")}>
                  Chat
                </button>
                <button type="button" className="btn-secundario flex-1" aria-pressed={vista === "personas"} onClick={() => setVista("personas")}>
                  Personas ({personas.length})
                </button>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                {/* Mosaico de personas y botón para salir (en pantallas angostas va en la pestaña «Personas»). */}
                <section aria-label="Participantes" className={vista === "personas" ? "" : "hidden lg:block"}>
                  <MosaicoPersonas personas={personas} miUid={miUid} />

                  <div className="mt-5 flex justify-center">
                    <Link to="/salas" className="flex min-h-11 flex-col items-center gap-1 text-sm font-semibold text-texto no-underline">
                      <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-[#b3261e] text-white">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </span>
                      Salir de la sala
                    </Link>
                  </div>
                </section>

                <section
                  aria-label="Chat de la sala"
                  className={`tarjeta h-[32rem] overflow-hidden p-0 ${vista === "chat" ? "" : "hidden lg:block"}`}
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
                </section>

                <aside className={`tarjeta lg:self-start ${vista === "personas" ? "" : "hidden lg:block"}`}>
                  <ListaPersonas personas={personas} miUid={miUid} />
                </aside>
              </div>
            </>
          )}

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
      ) : null}
    </div>
  );
}
