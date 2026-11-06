import { createContext, useContext, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

// SESIÓN DE DEMOSTRACIÓN (Sprint 0).
// Simula entrar y salir para mostrar cómo se comporta la aplicación. NO es seguridad real:
// el ingreso verdadero (Firebase Auth y validación en la API) llega en el Sprint 1 (TS-01, US-03).
export interface Usuario {
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  avatar: number;
}

interface ContextoSesion {
  usuario: Usuario | null;
  ingresar: (usuario: Usuario) => void;
  actualizar: (usuario: Usuario) => void;
  salir: () => void;
}

const CLAVE = "sesionDemo";
const Contexto = createContext<ContextoSesion | null>(null);

function leer(): Usuario | null {
  try {
    const texto = localStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as Usuario) : null;
  } catch {
    return null;
  }
}

function guardar(usuario: Usuario | null): void {
  try {
    if (usuario) localStorage.setItem(CLAVE, JSON.stringify(usuario));
    else localStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento, la sesión solo dura esta visita */
  }
}

export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(leer);

  const valor: ContextoSesion = {
    usuario,
    ingresar: (u) => {
      guardar(u);
      setUsuario(u);
    },
    actualizar: (u) => {
      guardar(u);
      setUsuario(u);
    },
    salir: () => {
      guardar(null);
      setUsuario(null);
    },
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return contexto;
}

// Una ruta privada sin sesión lleva al ingreso y, tras ingresar, vuelve a la ruta pedida (US-03).
export function RutaPrivada({ children }: { children: ReactNode }) {
  const { usuario } = useSesion();
  const ubicacion = useLocation();
  if (!usuario) return <Navigate to="/ingreso" replace state={{ desde: ubicacion.pathname }} />;
  return <>{children}</>;
}
