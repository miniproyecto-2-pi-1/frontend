import { Link } from "react-router-dom";

// Marca del prototipo: cuadro morado con «S» + «Salón de Estudio». La «S» es decorativa: el enlace se llama por el texto.
export function Logo({ a = "/", conMarca = true }: { a?: string; conMarca?: boolean }) {
  return (
    <Link to={a} className="flex min-w-0 items-center gap-3 rounded-lg text-texto no-underline">
      {conMarca && (
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-principal font-bold text-white shadow-sm"
        >
          S
        </span>
      )}
      <span className="truncate text-lg font-bold tracking-tight sm:text-xl">Salón de Estudio</span>
    </Link>
  );
}
