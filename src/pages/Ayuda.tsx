import { useTitulo } from "../hooks/useTitulo";

const PREGUNTAS = [
  { p: "¿Cómo creo una sala?", r: "Desde Mis salas, con el botón Nueva sala. Recibirás un ID de sala para compartir con tu grupo." },
  { p: "¿Cómo me uno a una sala?", r: "Con el ID de sala que te compartió quien la creó. Esta opción estará disponible muy pronto." },
  { p: "¿Mi micrófono y mi cámara se activan solos?", r: "No. Siempre empiezan apagados y los enciendes tú con sus botones." },
];

export function Ayuda() {
  useTitulo("Ayuda");
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-bold">Ayuda</h1>
      <div className="flex flex-col gap-4">
        {PREGUNTAS.map((x) => (
          <section key={x.p} className="tarjeta">
            <h2 className="mb-1 text-lg font-bold">{x.p}</h2>
            <p className="text-suave">{x.r}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
