import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSesion } from "./SesionContext";

// Mientras se conoce la sesión. El servidor (plan gratuito de Render) puede tardar hasta un minuto en despertar.
// Si GET /users/me falla por red o por el servidor, se muestra el error con «Reintentar».
function CargandoSesion() {
  const { errorConexion, reintentar } = useSesion();

  if (errorConexion) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div role="alert" className="tarjeta">
          <p className="font-bold text-error">No pudimos conectar con el servidor</p>
          <p className="mb-4 text-suave">{errorConexion.message}</p>
          <button type="button" className="btn-principal" onClick={reintentar}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div role="status" className="tarjeta flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-1 inline-block size-5 shrink-0 animate-spin rounded-full border-[3px] border-borde border-t-enlace"
        />
        <div>
          <p className="font-bold">Conectando con el servidor…</p>
          <p className="text-suave">Si el servidor estaba inactivo, puede tardar hasta un minuto.</p>
        </div>
      </div>
    </div>
  );
}

// Ruta privada: solo con el perfil completo ("listo").
// Sin sesión lleva al ingreso guardando la ruta de origen, para volver a ella después de ingresar (US-03).
export function RutaPrivada({ children }: { children: ReactNode }) {
  const { estado } = useSesion();
  const ubicacion = useLocation();

  if (estado === "cargando") return <CargandoSesion />;
  if (estado === "sinUsername") return <Navigate to="/elegir-username" replace />;
  if (estado === "anonimo")
    return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname + ubicacion.search + ubicacion.hash }} />;
  return <>{children}</>;
}

// /elegir-username solo se abre cuando falta el nombre de usuario ("sinUsername").
export function RutaSinUsername({ children }: { children: ReactNode }) {
  const { estado } = useSesion();

  if (estado === "cargando") return <CargandoSesion />;
  if (estado === "anonimo") return <Navigate to="/ingreso" replace />;
  if (estado === "listo") return <Navigate to="/salas" replace />;
  return <>{children}</>;
}
