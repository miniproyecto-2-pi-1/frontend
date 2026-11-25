import {useEffect,useState} from "react";
import {Link,useLocation,useParams} from "react-router-dom";
import {ApiError,apiFetch} from "../api";
import { EstadoConexionSala } from "../components/EstadoConexionSala";
import { useSalaTiempoReal } from "../hooks/useSalaTiempoReal";
import { useTitulo } from "../hooks/useTitulo";
import type { SalaPropia } from "./MisSalas";

export function Sala() {
  const { id = "" } = useParams();
  const ubicacion = useLocation();

  const creada =
    (
      ubicacion.state as {
        salaCreada?: boolean;
      } | null
    )?.salaCreada === true;

  const [sala, setSala] =
    useState<SalaPropia | null>(null);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [mensaje, setMensaje] =
    useState("");

  const [intento, setIntento] =
    useState(0);

  useTitulo(
    sala?.nombre ?? "Sala"
  );

  // Con la sala cargada se abre el tiempo real y se entra a ella con su ID oficial (US-08).
  const tiempoReal = useSalaTiempoReal(
    sala?.id ?? "",
    sala !== null
  );

  useEffect(() => {
    const control = new AbortController();

    setCargando(true);
    setError("");

    apiFetch<SalaPropia>(
      `/api/v1/rooms/${encodeURIComponent(id)}`,
      {
        signal: control.signal,
      }
    )
      .then(setSala)
      .catch((e: unknown) => {
        if (control.signal.aborted) return;

        if (
          e instanceof ApiError &&
          (
            e.code === "ROOM_NOT_FOUND" ||
            e.status === 404
          )
        ) {
          setError(
            "Sala no encontrada. Revisa el ID."
          );
        } else {
          setError(
            "No pudimos cargar la sala. Revisa tu conexión e inténtalo de nuevo."
          );
        }
      })
      .finally(() => {
        if (!control.signal.aborted) {
          setCargando(false);
        }
      });

    return () => control.abort();
  }, [id, intento]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(id);

      setMensaje(
        `ID copiado: ${id}`
      );
    } catch {
      setMensaje(
        "No pudimos copiar el ID. Inténtalo de nuevo."
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        to="/salas"
        className="mb-6 inline-block font-semibold text-enlace underline"
      >
        ← Mis salas
      </Link>

      {cargando ? (
        <p
          role="status"
          className="tarjeta"
        >
          Conectando… Cargando tu sala…
        </p>
      ) : error ? (
        <div role="alert">
          <p className="mb-4 rounded-lg bg-red-100 p-4 text-red-800 dark:bg-red-950 dark:text-red-200">
            {error}
          </p>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setIntento((i) => i + 1)
            }
          >
            Reintentar
          </button>
        </div>
      ) : sala ? (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">
              {sala.nombre}
            </h1>

            <EstadoConexionSala
              estado={tiempoReal.estado}
              unida={tiempoReal.unida}
            />

            {sala.esAdministrador !== false ? (
              <span className="text-sm font-semibold text-enlace">
                Anfitrión
              </span>
            ) : (
              <span className="text-sm font-semibold text-suave">
                Invitado
              </span>
            )}
          </div>

          {creada && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-exito-fondo p-3 text-exito"
            >
              ✓ Sala creada. Eres su anfitrión.
            </p>
          )}

          <section className="tarjeta mb-5">
            <p className="mb-2 text-sm text-suave">
              ID de la sala
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <strong className="font-mono text-xl">
                {sala.id}
              </strong>

              <button
                type="button"
                className="btn-secundario"
                onClick={() =>
                  void copiar()
                }
              >
                ▢ Copiar ID
              </button>
            </div>

            <p className="mt-3 text-sm text-suave">
              Comparte este ID para que otras
              personas se unan a la sala.
            </p>
          </section>

          {mensaje && (
            <p
              role="status"
              aria-live="polite"
              className="mb-4 rounded-lg bg-exito-fondo p-3 text-exito"
            >
              ✓ {mensaje}
            </p>
          )}

          {tiempoReal.errorUnirse ? (
            <div role="alert">
              <p className="mb-4 rounded-lg bg-error-fondo p-4 font-medium text-error">
                {tiempoReal.errorUnirse}
              </p>

              <button
                type="button"
                className="btn-secundario"
                onClick={tiempoReal.reintentar}
              >
                Reintentar
              </button>
            </div>
          ) : !tiempoReal.unida ? (
            <p
              role="status"
              className="tarjeta"
            >
              Entrando a la sala…
            </p>
          ) : (
            <section className="rounded-lg border-2 border-dashed border-borde px-5 py-12 text-center">
              <h2 className="mb-2 font-bold">
                Todavía no hay nadie más aquí
              </h2>

              <p className="text-suave">
                Cuando alguien se una con el ID,
                aparecerá en la sala.
              </p>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
