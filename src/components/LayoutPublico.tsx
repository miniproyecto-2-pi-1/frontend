import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSesion } from "../sesion/SesionContext";
import { PieDePagina, SaltarAlContenido, useFocoAlNavegar } from "./Estructura";
import { ThemeToggle } from "./ThemeToggle";

// Estructura de las pantallas públicas (antes de ingresar): inicio, ingreso, registro, ayuda,
// base técnica y página no encontrada.
export function LayoutPublico() {
  const { pathname } = useLocation();
  const principal = useFocoAlNavegar(pathname);
  const { usuario, salir } = useSesion();

  return (
    <div className="flex min-h-screen flex-col">
      <SaltarAlContenido />
      <header className="border-b border-borde">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-texto no-underline">
            Salón de Estudio
          </Link>
          <nav aria-label="Principal" className="mr-auto">
            <ul className="flex gap-5">
              {[
                { a: "/", texto: "Inicio", fin: true },
                { a: "/ayuda", texto: "Ayuda", fin: false },
              ].map((e) => (
                <li key={e.a}>
                  <NavLink
                    to={e.a}
                    end={e.fin}
                    className={({ isActive }) =>
                      `inline-block py-2 text-texto underline-offset-4 hover:underline ${isActive ? "font-bold underline" : ""}`
                    }
                  >
                    {e.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            {usuario ? (
              <>
                <Link to="/salas" className="btn-principal">
                  Ir a Mis salas
                </Link>
                <button type="button" onClick={salir} className="btn-secundario">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/ingreso" className="btn-secundario">
                  Ingresar
                </Link>
                <Link to="/registro" className="btn-principal">
                  Crear cuenta
                </Link>
              </>
            )}
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
