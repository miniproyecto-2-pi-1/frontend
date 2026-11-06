import { PantallaPendiente } from "../components/PantallaPendiente";
import { useTitulo } from "../hooks/useTitulo";

export function MisSalas() {
  useTitulo("Mis salas");
  return (
    <PantallaPendiente
      titulo="Mis salas"
      etapas={[
        { sprint: "Sprint 2", historias: "US-06", que: "Crear salas y verlas en esta pantalla, con el botón Copiar ID." },
        { sprint: "Sprint 3", historias: "US-07 y US-08", que: "Editar y eliminar salas, y unirse a una sala con su ID." },
      ]}
    />
  );
}
