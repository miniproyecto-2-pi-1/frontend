import { useState } from "react";

// Botón de tema con ícono. Su nombre accesible dice lo que hará: «Activar modo oscuro» o «Activar modo claro».
// Guarda la elección en el navegador (index.html la aplica antes de pintar la página).
export function ThemeToggle() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains("dark"));

  function alternar() {
    const siguiente = !oscuro;
    document.documentElement.classList.toggle("dark", siguiente);
    try {
      localStorage.setItem("tema", siguiente ? "oscuro" : "claro");
    } catch {
      /* si el navegador bloquea el almacenamiento, el tema solo dura esta visita */
    }
    setOscuro(siguiente);
  }

  const etiqueta = oscuro ? "Activar modo claro" : "Activar modo oscuro";

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-borde text-texto hover:bg-superficie"
    >
      {oscuro ? (
        // Sol: al pulsarlo vuelve el modo claro.
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        // Luna: al pulsarlo se activa el modo oscuro.
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
