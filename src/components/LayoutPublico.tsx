import { Link, Outlet, useLocation } from "react-router-dom";
import { useSesion } from "../sesion/SesionContext";
import { PieDePagina, SaltarAlContenido, useFocoAlNavegar } from "./Estructura";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

// Pantallas que ya son el formulario de entrada: en ellas el encabezado no repite «Ingresar».
const SIN_ACCION = ["/ingreso", "/registro", "/elegir-username"];

// Estructura de las pantallas públicas: inicio, ingreso, registro, elegir username, ayuda, base técnica y 404.
// Encabezado del prototipo: logo «S» + «Salón de Estudio». En celular solo el logo y el botón de tema;
// en escritorio, además, «Ingresar» (o «Ir a Mis salas» con sesión).
export function LayoutPublico() {
  const { pathname } = useLocation();
  const principal = useFocoAlNavegar(pathname);
  const { estado } = useSesion();
  const mostrarAccion = !SIN_ACCION.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col">
      <SaltarAlContenido />
      <header className="border-b-[1.5px] border-borde">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Logo />
          <div className="flex shrink-0 items-center gap-3">
            {mostrarAccion && (
              <Link
                to={estado === "listo" ? "/salas" : "/ingreso"}
                className="btn-secundario hidden sm:inline-flex"
              >
                {estado === "listo" ? "Ir a Mis salas" : "Ingresar"}
              </Link>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main id="contenido" ref={principal} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <PieDePagina />
    </div>
  );
}
