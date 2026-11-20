import { useEffect, useRef, type ReactNode } from "react";

interface Props {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  alCerrar: () => void;
  ocupado?: boolean;
  iniciadorRef: React.RefObject<HTMLButtonElement | null>;
}

export function ModalAccesible({
  titulo,
  descripcion,
  children,
  alCerrar,
  ocupado = false,
  iniciadorRef,
}: Props) {
  const modal = useRef<HTMLDivElement>(null);
  const ocupadoRef = useRef(ocupado);
  const cerrarRef = useRef(alCerrar);

  ocupadoRef.current = ocupado;
  cerrarRef.current = alCerrar;

  useEffect(() => {
    const focoAnterior =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const selector =
      'input:not(:disabled), button:not(:disabled), ' +
      'textarea:not(:disabled), select:not(:disabled), a[href]';

    const primerControl =
      modal.current?.querySelector<HTMLElement>(
        "[data-foco-inicial]"
      ) ??
      modal.current?.querySelector<HTMLElement>(selector);

    (primerControl ?? modal.current)?.focus();

    function teclado(evento: KeyboardEvent) {
      if (evento.key === "Escape" && !ocupadoRef.current) {
        evento.preventDefault();
        cerrarRef.current();
      }

      if (evento.key !== "Tab") return;

      const controles = Array.from(
        modal.current?.querySelectorAll<HTMLElement>(selector) ?? []
      );

      if (!controles.length) {
        evento.preventDefault();
        modal.current?.focus();
        return;
      }

      const primero = controles[0];
      const ultimo = controles[controles.length - 1];

      if (
        evento.shiftKey &&
        (document.activeElement === primero ||
          !modal.current?.contains(document.activeElement))
      ) {
        evento.preventDefault();
        ultimo.focus();
      } else if (
        !evento.shiftKey &&
        (document.activeElement === ultimo ||
          !modal.current?.contains(document.activeElement))
      ) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", teclado);

    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", teclado);
      document.body.style.overflow = previo;

      queueMicrotask(() => {
        (iniciadorRef.current ?? focoAnterior)?.focus();
      });
    };
  }, [iniciadorRef]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !ocupadoRef.current) {
          cerrarRef.current();
        }
      }}
    >
      <div
        ref={modal}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        aria-describedby={
          descripcion ? "modal-descripcion" : undefined
        }
        className="w-full max-w-md rounded-xl border border-borde bg-fondo p-5 shadow-2xl sm:p-6"
      >
        <h2
          id="modal-titulo"
          className="mb-2 text-xl font-bold"
        >
          {titulo}
        </h2>

        {descripcion && (
          <p
            id="modal-descripcion"
            className="mb-4 text-suave"
          >
            {descripcion}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
