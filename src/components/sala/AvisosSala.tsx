import type { AvisoPresencia } from "../../hooks/useSalaPersonas";

// Avisos breves cuando alguien entra o sale. Están en una región «status» para que el lector de
// pantalla los anuncie sin mover el foco (WCAG 4.1.3).
export function AvisosSala({ avisos }: { avisos: AvisoPresencia[] }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-20 z-40 flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:items-end"
    >
      {avisos.map((a) => (
        <p
          key={a.id}
          className="flex max-w-sm items-center gap-2 rounded-lg border border-borde bg-fondo px-4 py-3 text-sm font-semibold shadow-lg"
        >
          <span aria-hidden="true" className={a.tipo === "entra" ? "text-exito" : "text-suave"}>
            {a.tipo === "entra" ? "＋" : "−"}
          </span>
          {a.texto}
        </p>
      ))}
    </div>
  );
}
