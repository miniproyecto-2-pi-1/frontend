import { useEffect } from "react";

// Cada pantalla tiene su propio título de página (WCAG 2.4.2).
export function useTitulo(titulo: string): void {
  useEffect(() => {
    document.title = `${titulo} · Salón de Estudio`;
  }, [titulo]);
}
