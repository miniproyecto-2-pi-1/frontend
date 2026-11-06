// Pantalla que todavía no se construye: muestra su título y en qué sprint se hará (y con qué historias).
interface Etapa {
  sprint: string;
  historias: string;
  que: string;
}

export function PantallaPendiente({ titulo, etapas }: { titulo: string; etapas: Etapa[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl font-bold">{titulo}</h1>
      <p className="mb-6 text-suave">Esta pantalla se hará en un sprint posterior. Por ahora solo existe su ruta.</p>
      <section aria-label={`Cuándo se hará ${titulo}`} className="tarjeta">
        <ul className="flex flex-col gap-3">
          {etapas.map((e) => (
            <li key={e.sprint + e.que}>
              <p className="font-bold">
                {e.sprint} <span className="font-normal text-suave">· {e.historias}</span>
              </p>
              <p>{e.que}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
