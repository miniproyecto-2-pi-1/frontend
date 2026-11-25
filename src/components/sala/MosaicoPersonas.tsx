import { Avatar } from "../Avatar";
import type { Persona } from "../../tipos";

// Mosaico con una casilla por persona conectada, como en el prototipo. Por ahora cada casilla muestra el avatar
// con iniciales: el video y el audio llegan en el Sprint 4. Quien usa la pantalla aparece primero.
export function MosaicoPersonas({ personas, miUid }: { personas: Persona[]; miUid: string }) {
  const ordenadas = [...personas].sort((a, b) => Number(b.uid === miUid) - Number(a.uid === miUid));

  return (
    <ul aria-label="Personas en la sala" className="grid gap-3 sm:grid-cols-2">
      {ordenadas.map((p) => (
        <li
          key={p.uid}
          className="relative grid aspect-[4/3] place-items-center rounded-xl border border-borde bg-principal-suave"
        >
          <Avatar nombre={p.username} color={p.avatar} className="size-16 text-2xl" />
          <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-borde bg-fondo px-3 py-1 text-sm">
            {p.username}
            {p.uid === miUid && " (tú)"}
          </span>
        </li>
      ))}
    </ul>
  );
}
