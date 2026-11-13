import { useIngresoGoogle } from "../sesion/useIngresoGoogle";
import { IconoError } from "./IconoError";

// Logo de Google (decorativo: el texto del botón ya dice «Google»).
function LogoGoogle() {
  return (
    <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

// Separador «o» entre el formulario y el botón de Google (decorativo).
export function SeparadorO() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 text-sm text-suave">
      <span className="h-px flex-1 bg-borde" />o<span className="h-px flex-1 bg-borde" />
    </div>
  );
}

// Botón secundario «Continuar con Google» con su mensaje de error (role="alert").
// `google` viene de useIngresoGoogle() para que la pantalla sepa cuándo navegar.
export function BotonGoogle({ google, deshabilitado = false }: { google: ReturnType<typeof useIngresoGoogle>; deshabilitado?: boolean }) {
  const { continuarConGoogle, autenticado, ocupado, error, puedeReintentar, reintentar } = google;
  const texto = !ocupado ? "Continuar con Google" : autenticado ? "Entrando…" : "Esperando a Google…";

  return (
    <div className="flex flex-col gap-3">
      <p role="status" className="sr-only">
        {ocupado ? texto : ""}
      </p>
      {error && (
        <div role="alert" className="rounded-lg border-[1.5px] border-error bg-fondo p-3 text-error">
          <p className="flex items-start gap-1.5 font-medium">
            <IconoError />
            <span>{error}</span>
          </p>
          {puedeReintentar && (
            <button type="button" onClick={reintentar} className="mt-2 font-bold text-enlace underline">
              Reintentar
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        // aria-disabled (no disabled) para que el foco se quede en el botón mientras la ventana está abierta.
        onClick={() => {
          if (!ocupado && !deshabilitado) void continuarConGoogle();
        }}
        aria-disabled={ocupado || deshabilitado}
        aria-busy={ocupado}
        className="btn-secundario w-full aria-disabled:cursor-wait aria-disabled:opacity-80"
      >
        <LogoGoogle />
        {texto}
      </button>
    </div>
  );
}
