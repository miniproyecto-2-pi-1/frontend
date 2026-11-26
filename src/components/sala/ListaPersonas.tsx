import { Avatar } from "../Avatar";
import type { Persona } from "../../tipos";

// Personas que están en la sala ahora. Tú apareces primero.
export function ListaPersonas({ personas, miUid }: { personas: Persona[]; miUid: string }) {
  const ordenadas = [...personas].sort((a, b) => Number(b.uid === miUid) - Number(a.uid === miUid));

  return (
    <section aria-labelledby="titulo-personas">
      <h2 id="titulo-personas" className="mb-3 font-bold">
        Personas <span className="font-normal text-suave">· {personas.length} en línea</span>
      </h2>

      <ul className="space-y-3">
        {ordenadas.map((p) => (
          <li key={p.uid} className="flex items-center gap-3">
            <Avatar nombre={p.username} color={p.avatar} tam={32} />
            <span className="min-w-0 flex-1 truncate">
              {p.username}
              {p.uid === miUid && <span className="text-suave"> (tú)</span>}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-exito">
              <span aria-hidden="true" className="size-2 rounded-full bg-exito" />
              En línea
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
