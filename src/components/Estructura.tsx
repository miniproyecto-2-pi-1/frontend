import { useEffect, useRef, type RefObject } from "react";
import { Link } from "react-router-dom";

// Enlace «Saltar al contenido»: primer elemento enfocable de cada pantalla (WCAG 2.4.1).
export function SaltarAlContenido() {
  return (
    <a
      href="#contenido"
      className="sr-only z-50 rounded-lg bg-principal px-4 py-2 font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3"
    >
      Saltar al contenido
    </a>
  );
}

// Al cambiar de pantalla, el foco pasa al contenido para que el lector de pantalla lo anuncie.
export function useFocoAlNavegar(ruta: string): RefObject<HTMLElement | null> {
  const principal = useRef<HTMLElement>(null);
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    principal.current?.focus();
  }, [ruta]);
  return principal;
}

// Pie de una línea, como el prototipo. La ruta /base-tecnica sigue existiendo aunque ya no tenga enlace aquí.
export function PieDePagina() {
  return (
    <footer>
      <p className="mx-auto max-w-6xl px-4 py-5 text-center text-sm text-suave">
        <Link to="/ayuda" className="text-enlace underline">
          Ayuda
        </Link>{" "}
        · Salón de Estudio
      </p>
    </footer>
  );
}
