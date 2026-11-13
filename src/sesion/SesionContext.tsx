import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, apiFetch } from "../api";
import { auth } from "../firebase";
import type { Usuario } from "../tipos";

export type { Usuario } from "../tipos";

// Sesión real (TS-01): Firebase Auth dice QUIÉN ingresó y la API dice si ya tiene perfil.
//   cargando    → todavía no se sabe (Firebase restaurando la sesión o esperando GET /users/me).
//   anonimo     → nadie ingresó.
//   sinUsername → ingresó, pero la API responde 404 PROFILE_INCOMPLETE: falta elegir el nombre de usuario.
//   listo       → ingresó y tiene perfil completo.
export type EstadoSesion = "cargando" | "anonimo" | "sinUsername" | "listo";

interface ContextoSesion {
  estado: EstadoSesion;
  // Perfil del usuario; solo existe cuando el estado es "listo".
  usuario: Usuario | null;
  // Si GET /users/me falla por red o por el servidor, el estado sigue en "cargando" y aquí queda el error.
  errorConexion: ApiError | null;
  // Vuelve a pedir GET /users/me (por ejemplo, desde un botón «Reintentar»).
  reintentar: () => void;
  // Cuando un POST crea o completa el perfil, la pantalla lo entrega aquí y la sesión pasa a "listo".
  perfilListo: (usuario: Usuario) => void;
  // Cierra la sesión en Firebase y limpia el estado.
  cerrarSesion: () => Promise<void>;
}

const Contexto = createContext<ContextoSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  // undefined = Firebase todavía no ha dicho si hay sesión.
  const [cuenta, setCuenta] = useState<User | null | undefined>(auth ? undefined : null);
  const [estado, setEstado] = useState<EstadoSesion>(auth ? "cargando" : "anonimo");
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [errorConexion, setErrorConexion] = useState<ApiError | null>(null);
  const [intento, setIntento] = useState(0);
  const peticion = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => setCuenta(u));
  }, []);

  useEffect(() => {
    if (cuenta === undefined) return;
    if (cuenta === null) {
      setUsuario(null);
      setErrorConexion(null);
      setEstado("anonimo");
      return;
    }

    const control = new AbortController();
    peticion.current = control;
    setUsuario(null);
    setErrorConexion(null);
    setEstado("cargando");

    apiFetch<Usuario>("/api/v1/users/me", { signal: control.signal })
      .then((perfil) => {
        setUsuario(perfil);
        setEstado("listo");
      })
      .catch((error: unknown) => {
        if (control.signal.aborted) return; // otra petición o un perfilListo() la reemplazó
        if (error instanceof ApiError && error.status === 404 && error.code === "PROFILE_INCOMPLETE") {
          setEstado("sinUsername");
          return;
        }
        if (error instanceof ApiError && error.status === 401 && auth) {
          // La API no aceptó el token: se cierra la sesión y onAuthStateChanged la deja en "anonimo".
          void signOut(auth).catch(() => undefined);
          return;
        }
        setErrorConexion(
          error instanceof ApiError ? error : new ApiError(0, "NETWORK_ERROR", "No pudimos conectar con el servidor."),
        );
      });

    return () => control.abort();
  }, [cuenta, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  const perfilListo = useCallback((perfil: Usuario) => {
    peticion.current?.abort(); // una respuesta vieja de GET /users/me no debe pisar el perfil nuevo
    setUsuario(perfil);
    setErrorConexion(null);
    setEstado("listo");
  }, []);

  const cerrarSesion = useCallback(async () => {
    peticion.current?.abort();
    if (auth) await signOut(auth);
    setUsuario(null);
    setErrorConexion(null);
    setEstado("anonimo");
  }, []);

  const valor = useMemo<ContextoSesion>(
    () => ({ estado, usuario, errorConexion, reintentar, perfilListo, cerrarSesion }),
    [estado, usuario, errorConexion, reintentar, perfilListo, cerrarSesion],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("useSesion debe usarse dentro de SesionProvider");
  return contexto;
}
