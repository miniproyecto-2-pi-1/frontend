import { PATRON_USERNAME } from "./tipos";

// Reglas del perfil que se comparten entre Registro (US-01) y Elegir username (US-02).
// Devuelven el mensaje de error o undefined si el valor es válido. El servidor vuelve a validar.

export function validarNombres(valor: string): string | undefined {
  return valor.trim() ? undefined : "Escribe tus nombres.";
}

export function validarApellidos(valor: string): string | undefined {
  return valor.trim() ? undefined : "Escribe tus apellidos.";
}

export function validarUsername(valor: string): string | undefined {
  const limpio = valor.trim();
  if (!limpio) return "Elige un nombre de usuario.";
  if (!PATRON_USERNAME.test(limpio)) return "Usa de 3 a 20 letras, números o guion bajo, sin espacios.";
  return undefined;
}

// Separa el displayName de Google en nombres y apellidos: la primera palabra como nombre y el resto como apellidos.
// Es solo una sugerencia; la persona puede corregirlos antes de continuar.
export function separarNombre(nombreVisible: string | null | undefined): { nombres: string; apellidos: string } {
  const [nombres = "", ...resto] = (nombreVisible ?? "").trim().split(/\s+/).filter(Boolean);
  return { nombres, apellidos: resto.join(" ") };
}
