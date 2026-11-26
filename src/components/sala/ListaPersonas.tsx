import { useId, useState } from "react";
import { Avatar } from "../Avatar";
import type { Persona } from "../../tipos";

// Personas que están en la sala ahora, con un buscador por nombre. Tú apareces primero.
// Abajo va la tarjeta para invitar: el ID de la sala y su botón de copiar.
export function ListaPersonas({
  personas,
  miUid,
  anfitrionUid,
  salaId,
  alCopiar,
}: {
  personas: Persona[];
  miUid: string;
  anfitrionUid?: string;
  salaId: string;
  alCopiar: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const idBusqueda = useId();

  const texto = busqueda.trim().toLowerCase();
  const visibles = [...personas]
    .sort((a, b) => Number(b.uid === miUid) - Number(a.uid === miUid))
    .filter((p) => p.username.toLowerCase().includes(texto));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <label htmlFor={idBusqueda} className="sr-only">
        Buscar participante
      </label>
      <div className="flex shrink-0 items-center gap-2 rounded-xl bg-sala-campo px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-enlace">
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
          className="campo-envuelto min-h-10 min-w-0 flex-1 bg-transparent text-sm text-texto placeholder:text-suave"
        />
      </div>

      <h3 className="mb-1 mt-4 shrink-0 px-2 text-xs font-bold uppercase tracking-wider text-suave">En línea · {visibles.length}</h3>

      <ul aria-label="Personas en línea" className="barra-fina min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {visibles.map((p) => (
          <li key={p.uid} className={`flex items-center gap-3 rounded-2xl px-2 py-2 ${p.uid === miUid ? "bg-sala-campo" : ""}`}>
            <span className="relative shrink-0">
              <Avatar nombre={p.username} color={p.avatar} tam={40} />
              <span aria-hidden="true" className="absolute -bottom-px -right-px size-3 rounded-full border-[2.5px] border-sala-tarjeta bg-exito" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="truncate font-bold">{p.username}</span>
                {p.uid === anfitrionUid && (
                  <span className="shrink-0 rounded-full bg-principal-suave px-2 py-0.5 text-[11px] font-bold text-enlace">Anfitrión</span>
                )}
              </span>
              <span className="block text-sm text-suave">{p.uid === miUid ? "Tú · En línea" : "En línea"}</span>
            </span>
          </li>
        ))}
      </ul>

      {texto && visibles.length === 0 && (
        <p role="status" className="px-2 text-sm text-suave">
          Nadie coincide con «{busqueda.trim()}».
        </p>
      )}

      <div className="mt-3 flex shrink-0 items-center gap-3 rounded-2xl bg-sala-campo px-4 py-3 text-sm text-suave">
        <span>
          Invita con el ID <b className="font-mono tracking-wide text-texto">{salaId}</b>
        </span>
        <button
          type="button"
          onClick={alCopiar}
          aria-label={`Copiar ID de la sala ${salaId}`}
          className="ml-auto inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-2 font-bold text-enlace hover:bg-principal-suave"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V6a2 2 0 0 1 2-2h9" />
          </svg>
          Copiar
        </button>
      </div>
    </div>
  );
}
