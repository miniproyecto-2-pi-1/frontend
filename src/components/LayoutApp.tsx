import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSesion } from "../sesion/SesionContext";
import { Avatar } from "./Avatar";
import { PieDePagina, SaltarAlContenido, useFocoAlNavegar } from "./Estructura";
import { ThemeToggle } from "./ThemeToggle";

// Estructura de las pantallas privadas (con sesión iniciada): Mis salas, Sala y Perfil.
export function LayoutApp() {
  const { pathname } = useLocation();
  const principal = useFocoAlNavegar(pathname);
  const { usuario, salir } = useSesion();
  const navegar = useNavigate();

  function cerrarSesion() {
    salir();
    navegar("/", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SaltarAlContenido />
      <header className="border-b border-borde">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/salas" className="text-lg font-bold text-texto no-underline">
            Salón de Estudio
          </Link>
          <nav aria-label="Principal" className="flex-1">
            <ul className="flex gap-5">
              {[
                { a: "/salas", texto: "Mis salas" },
                { a: "/perfil", texto: "Perfil" },
              ].map((e) => (
                <li key={e.a}>
                  <NavLink
                    to={e.a}
                    end={e.a === "/salas"}
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
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            {usuario && (
              <span className="flex items-center gap-2">
                <Avatar nombre={`${usuario.nombres} ${usuario.apellidos}`} color={usuario.avatar} />
                <span className="font-bold">{usuario.username}</span>
              </span>
            )}
            <button type="button" onClick={cerrarSesion} className="btn-secundario">
              Cerrar sesión
            </button>
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
