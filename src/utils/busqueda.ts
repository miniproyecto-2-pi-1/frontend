// Búsqueda de texto sin distinguir mayúsculas ni tildes («cálculo» se encuentra escribiendo «calculo»).

// Devuelve el texto sin tildes y en minúsculas, y para cada letra del resultado la posición que ocupa en el original.
function normalizar(texto: string): { norm: string; mapa: number[] } {
  let norm = "";
  const mapa: number[] = [];
  let i = 0;
  for (const letra of texto) {
    const simple = letra.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (const parte of simple) {
      norm += parte;
      mapa.push(i);
    }
    i += letra.length;
  }
  return { norm, mapa };
}

// Rangos [inicio, fin) del texto original donde aparece la consulta.
export function buscarCoincidencias(texto: string, consulta: string): Array<[number, number]> {
  const buscada = normalizar(consulta.trim()).norm;
  if (!buscada) return [];
  const { norm, mapa } = normalizar(texto);
  const rangos: Array<[number, number]> = [];
  let desde = 0;
  for (;;) {
    const pos = norm.indexOf(buscada, desde);
    if (pos < 0) break;
    const inicio = mapa[pos];
    const ultimo = mapa[pos + buscada.length - 1];
    // El final incluye la letra completa del original (una «á» ocupa un lugar aunque se normalice a «a»).
    const fin = ultimo + (texto.codePointAt(ultimo)! > 0xffff ? 2 : 1);
    rangos.push([inicio, fin]);
    desde = pos + buscada.length;
  }
  return rangos;
}
