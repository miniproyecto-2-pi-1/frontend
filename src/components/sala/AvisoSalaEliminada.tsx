import { useRef } from "react";
import { ModalAccesible } from "../ModalAccesible";

// Aviso para quienes están dentro cuando el anfitrión elimina la sala (US-07). Llega por el evento «sala-eliminada».
// Cerrarlo de cualquier forma (botón, Esc o clic afuera) lleva a Mis salas: la sala ya no existe.
export function AvisoSalaEliminada({ nombre, alIrAMisSalas }: { nombre: string; alIrAMisSalas: () => void }) {
  const sinIniciador = useRef<HTMLButtonElement | null>(null);

  return (
    <ModalAccesible
      titulo="Esta sala fue eliminada"
      descripcion={`El anfitrión eliminó «${nombre}». Los mensajes del grupo ya no están disponibles.`}
      alCerrar={alIrAMisSalas}
      iniciadorRef={sinIniciador}
    >
      <div className="flex justify-end">
        <button type="button" data-foco-inicial className="btn-principal" onClick={alIrAMisSalas}>
          Ir a Mis salas
        </button>
      </div>
    </ModalAccesible>
  );
}
