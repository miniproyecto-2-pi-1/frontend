import { useParams } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";

// Sala: video, personas y chat llegan en los sprints 3 y 4.
export function Sala() {
  const { id } = useParams();
  useTitulo("Sala");
  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Sala</h1>
      <p className="mb-6 text-suave">ID de sala: {id}</p>
      <section className="tarjeta">
        <p>La cuadrícula de personas, el chat y los controles de la sala llegan en los sprints siguientes.</p>
      </section>
    </div>
  );
}
