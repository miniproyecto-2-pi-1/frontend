import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { Campo } from "../components/Campo";
import { SelectorAvatar } from "../components/SelectorAvatar";
import { auth } from "../firebase";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";
import type { DatosUsername, Usuario } from "../tipos";
import { separarNombre, validarApellidos, validarNombres, validarUsername } from "../validacion";
import { IconoError } from "../components/IconoError";

type CampoPerfil = "nombres" | "apellidos" | "username";
type Errores = Partial<Record<CampoPerfil | "general", string>>;

const CAMPOS: readonly string[] = ["nombres", "apellidos", "username"];

function erroresDeApi(error: unknown): Errores {
  if (!(error instanceof ApiError)) return { general: "No pudimos guardar tu perfil. Inténtalo de nuevo." };
  if (error.code === "USERNAME_TAKEN") return { username: error.message };
  if (error.code === "VALIDATION" && error.fields) {
    const errores: Errores = {};
    for (const [campo, mensaje] of Object.entries(error.fields)) {
      if (CAMPOS.includes(campo)) errores[campo as CampoPerfil] = mensaje;
      else errores.general = mensaje;
    }
    return errores;
  }
  return { general: error.message };
}

// Completar el perfil (US-02): quien ingresó con Google y aún no tiene nombre de usuario (404 PROFILE_INCOMPLETE).
// Solo se abre con el estado "sinUsername" (ver RutaSinUsername). No está en el prototipo: sigue el estilo de Registro.
export function ElegirUsername() {
  useTitulo("Elige tu nombre de usuario");
  const { perfilListo, cerrarSesion } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const desde = (ubicacion.state as { desde?: string } | null)?.desde ?? "/salas";
  const formulario = useRef<HTMLFormElement>(null);
  const alerta = useRef<HTMLParagraphElement>(null);

  const cuenta = auth?.currentUser ?? null;
  const [valores, setValores] = useState<Record<CampoPerfil, string>>(() => ({
    ...separarNombre(cuenta?.displayName),
    username: "",
  }));
  const [avatar, setAvatar] = useState(0);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);

  // Tras un intento fallido, el foco va al primer campo con error; si solo hay error general, al aviso.
  useEffect(() => {
    if (intentos === 0) return;
    const campo = formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (campo) campo.focus();
    else alerta.current?.focus();
  }, [intentos]);

  const cambiar = (campo: CampoPerfil) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  function mostrarErrores(n: Errores) {
    setErrores(n);
    setIntentos((x) => x + 1);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando || saliendo) return; // los botones usan aria-disabled para no perder el foco
    const locales = Object.fromEntries(
      Object.entries({
        nombres: validarNombres(valores.nombres),
        apellidos: validarApellidos(valores.apellidos),
        username: validarUsername(valores.username),
      }).filter(([, mensaje]) => mensaje),
    ) as Errores;
    if (Object.keys(locales).length > 0) {
      mostrarErrores(locales);
      return;
    }
    setErrores({});

    const datos: DatosUsername = {
      username: valores.username.trim(),
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      avatar,
    };
    setEnviando(true);
    try {
      const perfil = await apiFetch<Usuario>("/api/v1/users/me/username", { method: "POST", body: datos });
      perfilListo(perfil);
      navegar(desde, { replace: true });
    } catch (error) {
      mostrarErrores(erroresDeApi(error)); // lo escrito se conserva
    } finally {
      setEnviando(false);
    }
  }

  // «Usar otra cuenta»: cierra la sesión de Google y vuelve al ingreso.
  async function usarOtraCuenta() {
    if (enviando || saliendo) return;
    setSaliendo(true);
    try {
      await cerrarSesion();
    } catch {
      /* aunque falle el cierre en Firebase, el estado local ya quedó limpio */
    }
    navegar("/ingreso", { replace: true });
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-1 text-3xl font-bold sm:text-center">Elige tu nombre de usuario</h1>
      <p className="mb-6 text-suave sm:text-center">Elige cómo te verán en las salas.</p>

      <form
        ref={formulario}
        onSubmit={enviar}
        className="tarjeta flex flex-col gap-5 p-4 sm:p-8"
        noValidate
        aria-describedby={errores.general ? "elegir-error" : undefined}
      >
        {cuenta?.email && (
          <p className="text-suave">
            Ingresaste con Google como <span className="font-bold text-texto [overflow-wrap:anywhere]">{cuenta.email}</span>.
          </p>
        )}

        {errores.general && (
          <p
            id="elegir-error"
            ref={alerta}
            role="alert"
            tabIndex={-1}
            className="flex items-start gap-1.5 rounded-lg border-[1.5px] border-error bg-fondo p-3 font-medium text-error"
          >
            <IconoError />
            <span>{errores.general}</span>
          </p>
        )}

        <p className="text-suave">Todos los campos son obligatorios.</p>

        <Campo
          requerido
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={valores.username}
          onChange={cambiar("username")}
          error={errores.username}
          ayuda="De 3 a 20 letras, números o guion bajo. Así te verán tus compañeros."
        />
        <Campo
          requerido
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          value={valores.nombres}
          onChange={cambiar("nombres")}
          error={errores.nombres}
        />
        <Campo
          requerido
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          value={valores.apellidos}
          onChange={cambiar("apellidos")}
          error={errores.apellidos}
        />

        <SelectorAvatar valor={avatar} onCambio={setAvatar} nombre={valores.nombres} />

        <button
          type="submit"
          className="btn-principal w-full aria-disabled:cursor-wait aria-disabled:opacity-80"
          aria-disabled={enviando || saliendo}
          aria-busy={enviando}
        >
          {enviando && (
            <span
              aria-hidden="true"
              className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {enviando ? "Guardando…" : "Continuar"}
        </button>
        <p role="status" className="sr-only">
          {enviando ? "Guardando…" : ""}
        </p>

        <p className="text-center">
          ¿No es tu cuenta?{" "}
          <button
            type="button"
            onClick={() => void usarOtraCuenta()}
            aria-disabled={enviando || saliendo}
            className="font-bold text-enlace underline"
          >
            Usar otra cuenta
          </button>
        </p>
      </form>
    </div>
  );
}
