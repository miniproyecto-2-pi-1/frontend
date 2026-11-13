import { useCallback, useEffect, useId, useRef, useState } from "react";

// Menú desplegable accesible (patrón «disclosure»): un botón con aria-expanded y aria-controls muestra un panel
// que va justo después en el orden de tabulación, así que se recorre con Tab y Shift+Tab.
// Se cierra con Esc (el foco vuelve al botón), con un clic afuera, al salir con Tab y al cambiar de ruta.
export function useDesplegable(ruta: string) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback((devolverFoco: boolean) => {
    setAbierto(false);
    if (devolverFoco) boton.current?.focus();
  }, []);

  // Al navegar (por ejemplo, tras elegir «Mi perfil») el menú se cierra; el foco lo maneja el cambio de pantalla.
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;
    const raiz = contenedor.current;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar(true);
    };
    // Clic afuera: se cierra. Si el clic no dejó el foco en otro control, vuelve al botón.
    const alPulsar = (e: PointerEvent) => {
      if (raiz?.contains(e.target as Node)) return;
      setAbierto(false);
      requestAnimationFrame(() => {
        const activo = document.activeElement;
        if (!activo || activo === document.body || raiz?.contains(activo)) boton.current?.focus();
      });
    };
    // Salir con Tab o Shift+Tab: se cierra sin mover el foco.
    const alSalirFoco = (e: FocusEvent) => {
      const destino = e.relatedTarget as Node | null;
      if (destino && !raiz?.contains(destino)) setAbierto(false);
    };

    document.addEventListener("keydown", alTeclear);
    document.addEventListener("pointerdown", alPulsar);
    raiz?.addEventListener("focusout", alSalirFoco);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("pointerdown", alPulsar);
      raiz?.removeEventListener("focusout", alSalirFoco);
    };
  }, [abierto, cerrar]);

  return {
    abierto,
    contenedor,
    // Para cerrar al elegir una opción (aunque lleve a la misma ruta y no haya cambio de pantalla).
    cerrar,
    // Props para el botón que abre el panel.
    propsBoton: {
      ref: boton,
      type: "button" as const,
      "aria-expanded": abierto,
      "aria-controls": id,
      onClick: () => setAbierto((v) => !v),
    },
    // Props para el panel (queda en el DOM, oculto, para que aria-controls siempre apunte a algo).
    propsPanel: { id, hidden: !abierto },
  };
}
