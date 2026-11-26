import { useId, useState, type ReactNode } from "react";

interface Props {
  titulo: string;
  // Dato al lado del título, en gris (por ejemplo «· 4 en línea»).
  detalle?: string;
  children: ReactNode;
  className?: string;
}

// Sección del panel lateral que se pliega y se despliega con su título (botón con aria-expanded).
// El contenido queda en la página aunque esté plegado: así el chat no pierde lo que se escribió ni los mensajes.
export function SeccionColapsable({ titulo, detalle, children, className = "" }: Props) {
  const id = useId();
  const [abierta, setAbierta] = useState(true);

  return (
    <section className={className}>
      <h2>
        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={id}
          onClick={() => setAbierta((v) => !v)}
          className="flex min-h-11 w-full items-center gap-2 px-4 text-left font-bold"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 transition-transform ${abierta ? "" : "-rotate-90"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {titulo}
          {detalle && <span className="font-normal text-suave">{detalle}</span>}
        </button>
      </h2>

      <div id={id} hidden={!abierta}>
        {children}
      </div>
    </section>
  );
}
