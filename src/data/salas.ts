// Datos de ejemplo de las salas (Sprint 0). Se guardan en el navegador solo para la demostración;
// las salas reales se guardan en Firestore a través de la API desde el Sprint 2 (US-06).
export interface Sala {
  id: string;
  nombre: string;
  rol: "Anfitrión" | "Invitado";
  conectadas: number;
  color: number;
}

export const COLORES_SALA = ["#6d3fe0", "#207a3f", "#a03e9b", "#0e7490"]; // todos con texto blanco a 4,5 : 1 o más

const INICIALES: Sala[] = [
  { id: "K7P2-91XQ", nombre: "Cálculo II", rol: "Anfitrión", conectadas: 3, color: 0 },
  { id: "M4T8-27ZB", nombre: "Proyecto Integrador", rol: "Anfitrión", conectadas: 0, color: 1 },
  { id: "R9D1-55LC", nombre: "Física Mecánica", rol: "Invitado", conectadas: 2, color: 2 },
];

const CLAVE = "salasDemo";

export function leerSalas(): Sala[] {
  try {
    const texto = localStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Sala[]) : INICIALES;
  } catch {
    return INICIALES;
  }
}

export function guardarSalas(salas: Sala[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(salas));
  } catch {
    /* sin almacenamiento, los cambios duran solo esta visita */
  }
}

// ID de sala con el formato XXXX-XXXX (sin letras ni números que se confundan).
export function generarId(): string {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const trozo = () =>
    Array.from({ length: 4 }, () => alfabeto[Math.floor(Math.random() * alfabeto.length)]).join("");
  return `${trozo()}-${trozo()}`;
}
