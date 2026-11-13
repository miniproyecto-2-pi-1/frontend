// Ícono de error del prototipo (círculo con «!»). Es decorativo: el texto del error ya lo dice todo.
// Toma el color del texto que lo rodea (currentColor), así sirve en modo claro y oscuro.
export function IconoError({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mt-[0.2em] size-[1.1em] shrink-0 ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
