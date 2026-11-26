import { buscarCoincidencias } from "../../utils/busqueda";

// Muestra un texto marcando las partes que coinciden con lo que se busca.
export function Resaltado({ texto, consulta }: { texto: string; consulta: string }) {
  const rangos = buscarCoincidencias(texto, consulta);
  if (rangos.length === 0) return <>{texto}</>;

  const partes: React.ReactNode[] = [];
  let desde = 0;
  rangos.forEach(([inicio, fin], i) => {
    if (inicio > desde) partes.push(texto.slice(desde, inicio));
    partes.push(
      <mark key={i} className="rounded-sm bg-[#fde68a] px-0.5 text-[#1f1a2e]">
        {texto.slice(inicio, fin)}
      </mark>,
    );
    desde = fin;
  });
  if (desde < texto.length) partes.push(texto.slice(desde));
  return <>{partes}</>;
}
