import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";

export function Inicio() {
  useTitulo("Inicio");
  const { usuario } = useSesion();
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center py-10 text-center">
      <h1 className="mb-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
        Estudia en grupo, con video y chat
      </h1>
      <p className="mb-8 text-lg text-suave">Crea una sala, comparte el código y estudien juntos.</p>
      <div className="flex flex-wrap justify-center gap-3">
        {usuario ? (
          <Link to="/salas" className="btn-principal">
            Ir a Mis salas
          </Link>
        ) : (
          <>
            <Link to="/registro" className="btn-principal">
              Crear cuenta
            </Link>
            <Link to="/ingreso" className="btn-secundario">
              Ingresar
            </Link>
          </>
        )}
      </div>
      <p className="mt-6">
        <Link to="/base-tecnica" className="btn-secundario">
          Ver la base técnica
        </Link>
      </p>
    </section>
  );
}
