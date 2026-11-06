import { PantallaPendiente } from "../components/PantallaPendiente";
import { useTitulo } from "../hooks/useTitulo";

export function Perfil() {
  useTitulo("Perfil");
  return (
    <PantallaPendiente
      titulo="Mi perfil"
      etapas={[
        { sprint: "Sprint 2", historias: "US-04", que: "Ver y editar tus datos: nombres, apellidos, avatar y nombre de usuario." },
        { sprint: "Sprint 2", historias: "US-05", que: "Eliminar tu cuenta con una ventana de confirmación." },
      ]}
    />
  );
}
