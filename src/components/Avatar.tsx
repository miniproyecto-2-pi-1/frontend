const COLORES = ["#6d3fe0", "#207a3f", "#a03e9b", "#0e7490", "#b4235a", "#a25a0e"];

export function iniciales(texto: string): string {
  const partes = texto.trim().split(/\s+/).filter(Boolean);
  const dos = partes.length > 1 ? partes[0][0] + partes[1][0] : texto.trim().slice(0, 2);
  return dos.toUpperCase();
}

export function colorAvatar(indice: number): string {
  return COLORES[indice % COLORES.length];
}

// Avatar con iniciales. Es decorativo: el nombre siempre está escrito al lado.
export function Avatar({ nombre, color = 0, tam = 36 }: { nombre: string; color?: number; tam?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: tam, height: tam, background: colorAvatar(color), fontSize: tam * 0.38 }}
    >
      {iniciales(nombre)}
    </span>
  );
}
