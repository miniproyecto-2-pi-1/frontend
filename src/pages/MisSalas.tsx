import { useState } from "react";
import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";

// Mis salas (US-03): por ahora siempre está vacía, porque crear y unirse a salas llega en los Sprints 2 y 3.
// El prototipo (docs/prototipo/mis-salas-*) solo muestra la lista con salas: el estado vacío sigue ese mismo estilo.
export function MisSalas() {
  useTitulo("Mis salas");
  const { usuario } = useSesion();
  const [avisoCrear, setAvisoCrear] = useState(false);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis salas</h1>
          {usuario && <p className="text-suave">Hola, {usuario.nombres}.</p>}
        </div>
        {/* Crear salas llega en el Sprint 2: el botón no navega a ninguna pantalla, solo lo avisa. */}
        <button
          type="button"
          className="btn-principal"
          aria-describedby={avisoCrear ? "aviso-crear" : undefined}
          onClick={() => setAvisoCrear(true)}
        >
          <span aria-hidden="true">+</span> Nueva sala
        </button>
      </div>

      <p id="aviso-crear" role="status" className={avisoCrear ? "mb-6 rounded-lg border border-borde bg-superficie p-3" : "sr-only"}>
        {avisoCrear ? "Crear salas estará disponible muy pronto." : ""}
      </p>

      <section aria-labelledby="titulo-vacio" className="tarjeta flex flex-col items-center px-6 py-12 text-center">
        <span aria-hidden="true" className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-fondo text-3xl">
          📚
        </span>
        <h2 id="titulo-vacio" className="mb-2 text-xl font-bold">
          Aún no tienes salas
        </h2>
        <p className="max-w-md text-suave">
          Cuando crees una sala o te unas a una con su código, aparecerá aquí para que entres con un clic.
        </p>
        <p className="mt-6 text-sm text-suave">
          ¿Quieres ver cómo es una sala?{" "}
          <Link to="/salas/K7P2-91XQ" className="font-bold text-enlace underline">
            Abre la sala de prueba
          </Link>
        </p>
      </section>
    </div>
  );
}
