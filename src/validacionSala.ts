// Reglas del código (ID) de una sala, iguales a las que usa la API: 8 letras y números, con un guion
// en medio (por ejemplo K7P2-91XQ). Se aceptan minúsculas, el guion opcional y espacios al inicio o al final.

export const EJEMPLO_ID = "K7P2-91XQ";

export type ResultadoCodigo = { ok: true; id: string } | { ok: false; error: string };

export function validarCodigoSala(texto: string): ResultadoCodigo {
  const limpio = texto.trim().toUpperCase();
  if (!limpio) return { ok: false, error: "Escribe el código de la sala." };

  const coincide = limpio.match(/^([A-Z0-9]{4})-?([A-Z0-9]{4})$/);
  if (!coincide) {
    return { ok: false, error: `Revisa el código: son 8 letras y números, por ejemplo ${EJEMPLO_ID}.` };
  }
  return { ok: true, id: `${coincide[1]}-${coincide[2]}` };
}

// True si el texto tiene espacios sobrantes al inicio o al final (se avisa que se quitan).
export function tieneEspaciosSobrantes(texto: string): boolean {
  return texto.length > 0 && texto !== texto.trim();
}
