import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useDesplegable } from "../hooks/useDesplegable";
import { useSesion } from "../sesion/SesionContext";
import { useSalir } from "../sesion/useSalir";
import { Avatar } from "./Avatar";
import { PieDePagina, SaltarAlContenido, useFocoAlNavegar } from "./Estructura";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const PANEL =
  "absolute top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-[10px] border-[1.5px] border-borde bg-fondo p-2 shadow-lg";
const OPCION =
  "flex min-h-11 w-full items-center rounded-lg px-3 text-left text-texto no-underline hover:bg-superficie";

// Estructura de las pantallas privadas (Mis salas, Sala y Perfil), con el encabezado del prototipo:
// botón ☰ a la izquierda (navegación) y avatar redondo a la derecha (menú de la cuenta).
export function LayoutApp() {
  const { pathname } = useLocation();
  const principal = useFocoAlNavegar(pathname);
  const { usuario } = useSesion();
  const salir = useSalir();
  const navegacion = useDesplegable(pathname);
  const cuenta = useDesplegable(pathname);

  const nombreCompleto = usuario ? `${usuario.nombres} ${usuario.apellidos}`.trim() : "";

  return (
    <div className="flex min-h-screen flex-col">
      <SaltarAlContenido />
      <header className="border-b-[1.5px] border-borde">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {/* Navegación (☰) */}
            <div ref={navegacion.contenedor} className="relative">
              <button
                {...navegacion.propsBoton}
                aria-label="Menú de navegación"
                className="inline-flex size-10 items-center justify-center rounded-lg text-texto hover:bg-superficie"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              <nav {...navegacion.propsPanel} aria-label="Principal" className={`${PANEL} left-0`}>
                <ul className="flex flex-col gap-1">
                  {[
                    { a: "/salas", texto: "Mis salas" },
                    { a: "/perfil", texto: "Perfil" },
                    { a: "/ayuda", texto: "Ayuda" },
                  ].map((e) => (
                    <li key={e.a}>
                      <NavLink
                        to={e.a}
                        end
                        onClick={() => navegacion.cerrar(false)}
                        className={({ isActive }) => `${OPCION} ${isActive ? "bg-superficie font-bold" : ""}`}
                      >
                        {e.texto}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <Logo a="/salas" conMarca={false} />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {/* Cuenta (avatar) */}
            <div ref={cuenta.contenedor} className="relative">
              <button
                {...cuenta.propsBoton}
                aria-label={usuario ? `Menú de la cuenta de ${usuario.username}` : "Menú de la cuenta"}
                className="inline-flex rounded-full"
              >
                <Avatar nombre={nombreCompleto || "Tú"} color={usuario?.avatar ?? 0} tam={40} />
              </button>
              <div {...cuenta.propsPanel} className={`${PANEL} right-0`}>
                {usuario && (
                  <div className="flex items-center gap-3 border-b border-borde px-3 pb-3 pt-2">
                    <Avatar nombre={nombreCompleto || "Tú"} color={usuario.avatar} tam={36} />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{usuario.username}</p>
                      <p className="truncate text-sm text-suave">{nombreCompleto}</p>
                    </div>
                  </div>
                )}
                <ul className="mt-1 flex flex-col gap-1">
                  <li>
                    <Link to="/perfil" onClick={() => cuenta.cerrar(false)} className={OPCION}>
                      Mi perfil
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={() => void salir()} className={OPCION}>
                      Cerrar sesión
                    </button>
                  </li>
                </ul>
              </div>
            </div>
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
