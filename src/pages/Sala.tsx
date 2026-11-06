import { useParams } from "react-router-dom";
import { PantallaPendiente } from "../components/PantallaPendiente";
import { useTitulo } from "../hooks/useTitulo";

export function Sala() {
  const { id } = useParams();
  useTitulo("Sala");
  return (
    <div>
      <PantallaPendiente
        titulo="Sala"
        etapas={[
          { sprint: "Sprint 3", historias: "US-10 y US-11", que: "Chat en tiempo real con historial." },
          { sprint: "Sprint 4", historias: "US-09 y US-12", que: "Cuadrícula de personas y transmisión de audio y video." },
          { sprint: "Sprint 5", historias: "US-13 y US-14", que: "Controles de micrófono y cámara, y compartir pantalla." },
        ]}
      />
      <p className="mx-auto mt-4 max-w-2xl text-suave">ID de sala en la dirección: {id}</p>
    </div>
  );
}
