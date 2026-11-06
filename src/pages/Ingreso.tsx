import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";

// Pantalla de ingreso. El inicio de sesión real llega en el Sprint 1 (TS-01 y US-03).
export function Ingreso() {
  useTitulo("Ingreso");
  const [aviso, setAviso] = useState(false);

  function enviar(e: FormEvent) {
    e.preventDefault();
    setAviso(true);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">¡Qué bueno verte!</h1>
      <p className="mb-6 text-suave">Entra y estudia con tu grupo.</p>
      <form onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="correo" className="mb-1 block font-bold">
            Correo electrónico
          </label>
          <input id="correo" name="correo" type="email" autoComplete="email" className="campo" />
        </div>
        <div>
          <label htmlFor="clave" className="mb-1 block font-bold">
            Contraseña
          </label>
          <input id="clave" name="clave" type="password" autoComplete="current-password" className="campo" />
        </div>
        <button type="submit" className="btn-principal">
          Ingresar
        </button>
        <div role="status">
          {aviso && <p className="text-suave">El ingreso se activa en el Sprint 1.</p>}
        </div>
        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-enlace underline">
            Crea tu cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
