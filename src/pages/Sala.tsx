import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { EstadoConexionSala } from "../components/EstadoConexionSala";
import { PanelChat } from "../components/sala/PanelChat";
import { useMensajesSala } from "../hooks/useMensajesSala";
import { useSalaTiempoReal } from "../hooks/useSalaTiempoReal";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";
import type { SalaPropia } from "./MisSalas";

export function Sala() {
  const { id = "" } = useParams();
  const ubicacion = useLocation();
  const { usuario } = useSesion();

  const creada = (ubicacion.state as { salaCreada?: boolean } | null)?.salaCreada === true;

  const [sala, setSala] = useState<SalaPropia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [intento, setIntento] = useState(0);

  useTitulo(sala?.nombre ?? "Sala");

  // Con la sala cargada se abre el tiempo real y se entra a ella con su ID oficial (US-08).
  const tiempoReal = useSalaTiempoReal(sala?.id ?? "", sala !== null);
  // Mensajes del chat (US-10).
  const { mensajes } = useMensajesSala(tiempoReal.cliente);

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
              <span className="text-sm font-semibold text-enlace">Anfitrión</span>
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
            <section aria-label="Chat de la sala" className="tarjeta h-[32rem] overflow-hidden p-0">
              {tiempoReal.cliente && (
                <PanelChat
                  cliente={tiempoReal.cliente}
                  roomId={sala.id}
                  estado={tiempoReal.estado}
                  mensajes={mensajes}
                  personas={[]}
                  miUid={usuario?.uid ?? ""}
                />
              )}
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
