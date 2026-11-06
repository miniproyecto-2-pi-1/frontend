import { useState } from "react";

// Botón para alternar entre modo claro y oscuro. Guarda la elección en el navegador.
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

  return (
    <button type="button" onClick={alternar} aria-pressed={oscuro} className="btn-secundario">
      Modo oscuro
    </button>
  );
}
