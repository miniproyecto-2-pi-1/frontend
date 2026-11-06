import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const ENLACES = [
  { a: "/", texto: "Inicio", fin: true },
  { a: "/salas", texto: "Mis salas" },
  { a: "/base-tecnica", texto: "Base técnica" },
  { a: "/ayuda", texto: "Ayuda" },
];

// Estructura común de todas las pantallas: encabezado, navegación, contenido y pie.
export function Layout() {
  const { pathname } = useLocation();
  const principal = useRef<HTMLElement>(null);
  const primera = useRef(true);

  // Al cambiar de pantalla, el foco pasa al contenido para que el lector de pantalla lo anuncie.
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    principal.current?.focus();
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenido"
        className="sr-only z-50 rounded-lg bg-principal px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-borde">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <Link to="/" className="text-lg font-bold text-texto no-underline">
            Salón de Estudio
          </Link>
          <nav aria-label="Principal" className="flex-1">
            <ul className="flex flex-wrap gap-x-5 gap-y-1">
              {ENLACES.map((e) => (
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
            <Link to="/ingreso" className="btn-secundario">
              Ingresar
            </Link>
            <Link to="/registro" className="btn-principal">
              Crear cuenta
            </Link>
          </div>
        </div>
      </header>

      <main id="contenido" ref={principal} tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-borde">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-suave">
          <p>Salón de Estudio · Proyecto Integrador I, Univalle</p>
          <Link to="/ayuda" className="text-enlace underline">
            Ayuda
          </Link>
        </div>
      </footer>
    </div>
  );
}
