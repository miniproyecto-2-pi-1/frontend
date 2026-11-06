import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { useTitulo } from "../hooks/useTitulo";

// Pantalla de la base técnica (TS-00): pide un dato a la API, que lo lee de Firestore,
// y lo muestra con sus tres estados: cargando, error (con "Reintentar") y éxito.
type Estado =
  | { tipo: "cargando" }
  | { tipo: "error"; mensaje: string }
  | { tipo: "exito"; mensaje: string; actualizadoEn: string };

interface RespuestaApi {
  mensaje: string;
  actualizadoEn: string;
}

const ESPERA_MAXIMA_MS = 60_000; // el plan gratuito de Render puede tardar hasta un minuto en despertar

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeStyle: "short" }).format(fecha);
}

export function BaseTecnica() {
  useTitulo("Base técnica");
  const [estado, setEstado] = useState<Estado>({ tipo: "cargando" });
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const control = new AbortController();
    let agotado = false;
    const temporizador = setTimeout(() => {
      agotado = true;
      control.abort();
    }, ESPERA_MAXIMA_MS);

    setEstado({ tipo: "cargando" });
    fetch(`${API_URL}/api/v1/base-tecnica`, { signal: control.signal })
      .then(async (respuesta) => {
        if (!respuesta.ok) {
          const cuerpo = (await respuesta.json().catch(() => null)) as { error?: { message?: string } } | null;
          throw new Error(cuerpo?.error?.message ?? `La API respondió con el código ${respuesta.status}.`);
        }
        return (await respuesta.json()) as RespuestaApi;
      })
      .then((dato) => setEstado({ tipo: "exito", mensaje: dato.mensaje, actualizadoEn: dato.actualizadoEn }))
      .catch((error: unknown) => {
        if (control.signal.aborted && !agotado) return; // se salió de la pantalla: no hay nada que mostrar
        const sinConexion = error instanceof TypeError || agotado;
        setEstado({
          tipo: "error",
          mensaje: sinConexion
            ? "Revisa tu conexión e inténtalo de nuevo."
            : error instanceof Error
              ? error.message
              : "Inténtalo de nuevo en unos minutos.",
        });
      })
      .finally(() => clearTimeout(temporizador));

    return () => {
      clearTimeout(temporizador);
      control.abort();
    };
  }, [intento]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold">Base técnica</h1>
      <p className="mb-6 text-suave">
        Esta pantalla pide un dato a la API. La API lo lee de Firestore y la aplicación lo muestra aquí.
      </p>

      <section aria-labelledby="titulo-dato" className="tarjeta">
        <h2 id="titulo-dato" className="mb-3 text-xl font-bold">
          Dato leído de Firestore
        </h2>

        {estado.tipo === "cargando" && (
          <div role="status" className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-1 inline-block size-5 shrink-0 animate-spin rounded-full border-[3px] border-borde border-t-enlace"
            />
            <div>
              <p className="font-bold">Cargando datos…</p>
              <p className="text-suave">Si el servidor estaba inactivo, puede tardar hasta un minuto.</p>
            </div>
          </div>
        )}

        {estado.tipo === "error" && (
          <div role="alert">
            <p className="font-bold text-error">No pudimos cargar los datos</p>
            <p className="mb-4 text-suave">{estado.mensaje}</p>
            <button type="button" className="btn-principal" onClick={() => setIntento((n) => n + 1)}>
              Reintentar
            </button>
          </div>
        )}

        {estado.tipo === "exito" && (
          <div role="status">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-exito-fondo px-3 py-0.5 font-bold text-exito">
              <span aria-hidden="true" className="size-2 rounded-full bg-exito" />
              Conectado a la API
            </p>
            <p className="rounded-lg bg-fondo p-3 text-lg">«{estado.mensaje}»</p>
            <p className="mt-3 text-suave">Última actualización: {formatearFecha(estado.actualizadoEn)}</p>
          </div>
        )}
      </section>
    </div>
  );
}
