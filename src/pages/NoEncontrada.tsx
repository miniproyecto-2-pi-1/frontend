import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";

// Página no encontrada (404).
export function NoEncontrada() {
  useTitulo("Página no encontrada");
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
      <p aria-hidden="true" className="mb-2 text-7xl font-bold leading-none text-enlace">
        404
      </p>
      <h1 className="mb-3 text-3xl font-bold">Página no encontrada</h1>
      <p className="mb-6 text-suave">La dirección no existe o la sala ya no está disponible.</p>
      <Link to="/salas" className="btn-principal">
        Ir a Mis salas
      </Link>
    </section>
  );
}
