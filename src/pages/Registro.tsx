import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTitulo } from "../hooks/useTitulo";

// Pantalla de registro. El registro real llega en el Sprint 1 (US-01 y US-02).
export function Registro() {
  useTitulo("Registro");
  const [aviso, setAviso] = useState(false);

  function enviar(e: FormEvent) {
    e.preventDefault();
    setAviso(true);
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">Crea tu cuenta</h1>
      <p className="mb-6 text-suave">Para entrar a tus salas de estudio.</p>
      <form onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="usuario" className="mb-1 block font-bold">
            Nombre de usuario
          </label>
          <input id="usuario" name="usuario" type="text" autoComplete="username" className="campo" />
        </div>
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
          <input id="clave" name="clave" type="password" autoComplete="new-password" className="campo" />
        </div>
        <button type="submit" className="btn-principal">
          Crear cuenta
        </button>
        <div role="status">
          {aviso && <p className="text-suave">El registro se activa en el Sprint 1.</p>}
        </div>
        <p className="text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/ingreso" className="text-enlace underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
