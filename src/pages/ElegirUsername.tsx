import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { Campo } from "../components/Campo";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";
import { PATRON_USERNAME, type DatosUsername, type Usuario } from "../tipos";

// Completar el perfil (TS-01): quien ingresó pero no tiene nombre de usuario (404 PROFILE_INCOMPLETE).
// Solo se abre con el estado "sinUsername" (ver RutaSinUsername). Usa los componentes existentes:
// el diseño definitivo de esta pantalla todavía no está en el prototipo.
export function ElegirUsername() {
  useTitulo("Elige tu nombre de usuario");
  const { perfilListo } = useSesion();
  const navegar = useNavigate();
  const formulario = useRef<HTMLFormElement>(null);

  const [username, setUsername] = useState("");
  const [error, setError] = useState<string>();
  const [errorGeneral, setErrorGeneral] = useState<string>();
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (intentos > 0) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const valor = username.trim();
    setErrorGeneral(undefined);
    const local = !valor
      ? "Elige un nombre de usuario."
      : !PATRON_USERNAME.test(valor)
        ? "Usa de 3 a 20 letras, números o guion bajo, sin espacios."
        : undefined;
    setError(local);
    setIntentos((n) => n + 1);
    if (local) return;

    setEnviando(true);
    try {
      const datos: DatosUsername = { username: valor };
      const perfil = await apiFetch<Usuario>("/api/v1/users/me/username", { method: "POST", body: datos });
      perfilListo(perfil);
      navegar("/salas", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && (err.code === "USERNAME_TAKEN" || err.code === "VALIDATION")) {
        setError(err.fields?.username ?? err.message);
      } else {
        setErrorGeneral(err instanceof ApiError ? err.message : "No pudimos guardar tu nombre de usuario. Inténtalo de nuevo.");
      }
      setIntentos((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">Elige tu nombre de usuario</h1>
      <p className="mb-6 text-suave">Así te verán tus compañeros en las salas.</p>

      <form ref={formulario} onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
        {errorGeneral && (
          <p role="alert" className="flex items-center gap-1 font-bold text-error">
            <span aria-hidden="true">⚠</span> {errorGeneral}
          </p>
        )}
        <Campo
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={error}
          ayuda="De 3 a 20 letras, números o guion bajo."
        />
        <button type="submit" className="btn-principal" disabled={enviando} aria-busy={enviando}>
          Continuar
        </button>
      </form>
    </div>
  );
}
