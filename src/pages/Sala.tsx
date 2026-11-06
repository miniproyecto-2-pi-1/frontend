import { Link, useParams } from "react-router-dom";
import { PantallaPendiente } from "../components/PantallaPendiente";
import { useTitulo } from "../hooks/useTitulo";

export function Sala() {
  const { id } = useParams();
  useTitulo("Sala");
  return (
    <PantallaPendiente
        titulo="Sala"
        etapas={[
          { sprint: "Sprint 3", historias: "US-10 y US-11", que: "Chat en tiempo real con historial." },
          { sprint: "Sprint 4", historias: "US-09 y US-12", que: "Cuadrícula de personas y transmisión de audio y video." },
          { sprint: "Sprint 5", historias: "US-13 y US-14", que: "Controles de micrófono y cámara, y compartir pantalla." },
        ]}
      >
        <p className="mt-4 text-suave">ID de sala en la dirección: {id}</p>
        <p className="mt-6">
          <Link to="/salas" className="btn-secundario">
            Volver a Mis salas
          </Link>
        </p>
      </PantallaPendiente>
  );
}
