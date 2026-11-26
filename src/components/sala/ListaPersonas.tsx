import { useId, useState } from "react";
import { Avatar } from "../Avatar";
import type { Persona } from "../../tipos";

// Personas que están en la sala ahora, con un buscador por nombre. Tú apareces primero.
// El título «Personas · N en línea» lo pone la sección plegable que la contiene.
export function ListaPersonas({ personas, miUid }: { personas: Persona[]; miUid: string }) {
  const [busqueda, setBusqueda] = useState("");
  const idBusqueda = useId();

  const texto = busqueda.trim().toLowerCase();
  const visibles = [...personas]
    .sort((a, b) => Number(b.uid === miUid) - Number(a.uid === miUid))
    .filter((p) => p.username.toLowerCase().includes(texto));

  return (
    <div>
      <label htmlFor={idBusqueda} className="sr-only">
        Buscar participante
      </label>
      <div className="mb-3 flex items-center gap-2 rounded-full border-[1.5px] border-campo bg-fondo px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-enlace">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-suave">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          id={idBusqueda}
          type="search"
          autoComplete="off"
          placeholder="Buscar participante"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="min-h-10 min-w-0 flex-1 bg-transparent text-texto outline-none placeholder:text-suave"
        />
      </div>

      <ul aria-label="Personas en línea" className="space-y-3">
        {visibles.map((p) => (
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

      {texto && visibles.length === 0 && (
        <p role="status" className="text-sm text-suave">
          Nadie coincide con «{busqueda.trim()}».
        </p>
      )}
    </div>
  );
}
