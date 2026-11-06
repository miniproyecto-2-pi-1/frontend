import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { Campo } from "../components/Campo";
import { Dialogo } from "../components/Dialogo";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";

// Perfil (demostración del Sprint 0): ver, editar y eliminar la cuenta.
// El perfil real (Firestore, a través de la API) llega en el Sprint 2 (US-04 y US-05).
export function Perfil() {
  useTitulo("Perfil");
  const { usuario, actualizar, salir } = useSesion();
  const navegar = useNavigate();
  const [valores, setValores] = useState(
    usuario ?? { nombres: "", apellidos: "", username: "", correo: "", avatar: 0 },
  );
  const [errorUsuario, setErrorUsuario] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [eliminar, setEliminar] = useState(false);

  if (!usuario) return null;

  const cambiar = (campo: "nombres" | "apellidos" | "username") => (e: { target: { value: string } }) => {
    setGuardado(false);
    setValores((v) => ({ ...v, [campo]: e.target.value }));
  };

  function guardar(e: FormEvent) {
    e.preventDefault();
    const nuevo = valores.username.trim();
    if (!nuevo) return setErrorUsuario("Elige un nombre de usuario.");
    if (nuevo.toLowerCase() === "admin") return setErrorUsuario("Ese nombre de usuario ya existe. Elige otro.");
    setErrorUsuario("");
    actualizar({ ...valores, username: nuevo });
    setGuardado(true);
  }

  function cancelar() {
    setValores(usuario!);
    setErrorUsuario("");
    setGuardado(false);
  }

  function eliminarCuenta() {
    try {
      localStorage.removeItem("usuarioDemo");
    } catch {
      /* nada que borrar */
    }
    salir();
    navegar("/", { replace: true });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-bold">Mi perfil</h1>

      <form onSubmit={guardar} className="tarjeta flex flex-col gap-4" noValidate>
        <div className="flex items-center gap-3">
          <Avatar nombre={`${valores.nombres} ${valores.apellidos}`} color={valores.avatar} tam={56} />
          <p className="text-suave">Correo: {usuario.correo}</p>
        </div>
        <Campo id="nombres" etiqueta="Nombres" value={valores.nombres} onChange={cambiar("nombres")} autoComplete="given-name" />
        <Campo id="apellidos" etiqueta="Apellidos" value={valores.apellidos} onChange={cambiar("apellidos")} autoComplete="family-name" />
        <Campo id="username" etiqueta="Nombre de usuario" value={valores.username} onChange={cambiar("username")} error={errorUsuario} autoComplete="username" />
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="btn-principal">
            Guardar cambios
          </button>
          <button type="button" className="btn-secundario" onClick={cancelar}>
            Cancelar
          </button>
        </div>
        <div role="status" className="font-bold text-exito">
          {guardado && "Cambios guardados."}
        </div>
      </form>

      <section aria-labelledby="zona" className="mt-8">
        <h2 id="zona" className="mb-2 text-xl font-bold">
          Eliminar cuenta
        </h2>
        <p className="mb-3 text-suave">Esta acción borra tu cuenta y no se puede deshacer.</p>
        <button
          type="button"
          onClick={() => setEliminar(true)}
          className="inline-flex min-h-11 items-center rounded-lg border-[1.5px] border-error px-5 py-2 font-bold text-error"
        >
          Eliminar cuenta
        </button>
      </section>

      <Dialogo abierto={eliminar} onCerrar={() => setEliminar(false)} titulo="¿Eliminar tu cuenta?">
        <p className="mb-5 text-suave">Se borrarán tus datos y saldrás de la aplicación. No se puede deshacer.</p>
        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secundario" onClick={() => setEliminar(false)}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={eliminarCuenta}
            className="inline-flex min-h-11 items-center rounded-lg px-5 py-2 font-bold text-white"
            style={{ background: "#b3261e" }}
          >
            Eliminar cuenta
          </button>
        </div>
      </Dialogo>
    </div>
  );
}
