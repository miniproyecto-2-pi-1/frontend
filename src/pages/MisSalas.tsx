import { useTitulo } from "../hooks/useTitulo";

// Mis salas: la lista real de salas llega en el Sprint 2 (US-06).
export function MisSalas() {
  useTitulo("Mis salas");
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Mis salas</h1>
      <section aria-labelledby="vacio" className="tarjeta mx-auto max-w-xl text-center">
        <h2 id="vacio" className="mb-2 text-xl font-bold">
          Aún no tienes salas
        </h2>
        <p className="text-suave">
          Crea una sala o únete con el ID de la sala que te compartieron. Esta función se activa en el Sprint 2.
        </p>
      </section>
    </div>
  );
}
