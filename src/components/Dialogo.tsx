import { useEffect, useId, useRef, type ReactNode } from "react";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}

// Ventana de diálogo accesible con el elemento nativo <dialog>: atrapa el foco dentro,
// se cierra con Esc y devuelve el foco al botón que la abrió.
export function Dialogo({ abierto, onCerrar, titulo, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      className="m-auto w-[min(92vw,28rem)] rounded-[10px] border border-borde bg-fondo p-6 text-texto backdrop:bg-black/60"
    >
      <h2 id={idTitulo} className="mb-3 text-xl font-bold">
        {titulo}
      </h2>
      {children}
    </dialog>
  );
}
