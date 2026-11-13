import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";

export function Inicio() {
  useTitulo("Inicio");
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
      <h1 className="mb-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
        Estudia en grupo, con video y chat
      </h1>
      <p className="mb-8 text-lg text-suave">Crea una sala, comparte el código y estudia con tu grupo.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to="/registro" className="btn-principal">
          Crear cuenta
        </Link>
        <Link to="/ingreso" className="btn-secundario">
          Ingresar
        </Link>
      </div>
    </section>
  );
}
