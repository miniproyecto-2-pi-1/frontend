import { useTitulo } from "../hooks/useTitulo";

// Perfil: ver y editar el perfil llega en el Sprint 2 (US-04 y US-05).
export function Perfil() {
  useTitulo("Perfil");
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Mi perfil</h1>
      <section className="tarjeta">
        <p>Aquí podrás ver y editar tus datos, y eliminar tu cuenta. Se activa en el Sprint 2.</p>
      </section>
    </div>
  );
}
