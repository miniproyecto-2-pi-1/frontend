import { useNavigate } from "react-router-dom";
import { useSesion } from "./SesionContext";

// Cerrar sesión (US-03): cierra la sesión en Firebase, limpia el perfil en memoria y va al ingreso.
// Se usa replace para que la pantalla privada no quede en el historial: con «Atrás» no se ve ningún dato,
// y si se llega a una ruta privada, RutaPrivada (estado "anonimo") vuelve a mandar al ingreso.
export function useSalir(): () => Promise<void> {
  const { cerrarSesion } = useSesion();
  const navegar = useNavigate();
  return async () => {
    try {
      await cerrarSesion();
    } catch {
      /* aunque falle el cierre en Firebase, el estado local ya quedó limpio */
    }
    navegar("/ingreso", { replace: true });
  };
}
