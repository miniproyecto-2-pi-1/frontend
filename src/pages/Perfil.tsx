
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "../api";
import { auth } from "../firebase";
import { Avatar } from "../components/Avatar";
import { Campo } from "../components/Campo";
import { SelectorAvatar } from "../components/SelectorAvatar";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";
import type { Usuario } from "../tipos";
import {
  validarApellidos,
  validarNombres,
  validarUsername,
} from "../validacion";

type Datos = Pick<
  Usuario,
  "nombres" | "apellidos" | "username" | "correo" | "avatar"
>;

type Errores = Partial<Record<keyof Datos | "general", string>>;

const desdeUsuario = (u: Usuario): Datos => ({
  nombres: u.nombres,
  apellidos: u.apellidos,
  username: u.username,
  correo: u.correo,
  avatar: u.avatar,
});

function comprobar(d: Datos, google: boolean): Errores {
  const errores: Errores = {};

  errores.nombres = validarNombres(d.nombres);
  errores.apellidos = validarApellidos(d.apellidos);
  errores.username = validarUsername(d.username);

  if (!/^\S+@\S+\.\S+$/.test(d.correo.trim())) {
    errores.correo = "Escribe un correo electrónico válido.";
  }

  if (!Number.isInteger(d.avatar) || d.avatar < 0 || d.avatar > 5) {
    errores.avatar = "Selecciona un avatar válido.";
  }

  if (
    google &&
    auth?.currentUser?.email &&
    d.correo !== auth.currentUser.email
  ) {
    errores.correo =
      "Ingresaste con Google; el correo no se puede cambiar aquí.";
  }

  return Object.fromEntries(
    Object.entries(errores).filter(([, valor]) => Boolean(valor))
  ) as Errores;
}

function erroresServidor(error: unknown): Errores {
  if (!(error instanceof ApiError)) {
    return {
      general: "No pudimos guardar tus cambios. Inténtalo de nuevo.",
    };
  }

  if (error.code === "USERNAME_TAKEN") {
    return {
      username: "Ese nombre de usuario ya existe. Elige otro.",
    };
  }

  if (error.code === "EMAIL_TAKEN") {
    return {
      correo: "Ese correo ya está registrado. Usa otro.",
    };
  }

  if (error.code === "EMAIL_CHANGE_NOT_ALLOWED") {
    return {
      correo: "Ingresaste con Google; el correo no se puede cambiar aquí.",
    };
  }

  if (error.code === "VALIDATION") {
    return (
      error.fields && Object.keys(error.fields).length
        ? error.fields
        : { general: error.message }
    ) as Errores;
  }

  if (error.code === "PROFILE_INCOMPLETE") {
    return {
      general: "Debes elegir un nombre de usuario para continuar.",
    };
  }

  return {
    general:
      error.status === 0
        ? "No pudimos conectar con el servidor. Inténtalo de nuevo."
        : error.message,
  };
}

export function Perfil() {
  useTitulo("Mi perfil");

  const { usuario, perfilListo } = useSesion();

  const [datos, setDatos] = useState<Datos | null>(
    () => (usuario ? desdeUsuario(usuario) : null)
  );

  const [errores, setErrores] = useState<Errores>({});
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const formularioRef = useRef<HTMLFormElement>(null);

  const google =
    auth?.currentUser?.providerData.some(
      (proveedor) => proveedor.providerId === "google.com"
    ) ?? false;

  useEffect(() => {
    if (usuario) {
      setDatos(desdeUsuario(usuario));
      setErrores({});
    }
  }, [usuario]);

  function modificar(
    campo: Exclude<keyof Datos, "avatar">,
    valor: string
  ) {
    setDatos((d) => (d ? { ...d, [campo]: valor } : null));

    setErrores((e) => ({
      ...e,
      [campo]: undefined,
      general: undefined,
    }));

    setExito("");
  }

  function cancelar() {
    if (!usuario) return;

    setDatos(desdeUsuario(usuario));
    setErrores({});
    setExito("");
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();

    if (guardando || !datos || !usuario) return;

    const pendiente =
      JSON.stringify(datos) !== JSON.stringify(desdeUsuario(usuario));

    if (!pendiente) return;

    const locales = comprobar(datos, google);

    if (Object.keys(locales).length) {
      setErrores(locales);

      requestAnimationFrame(() =>
        formularioRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus()
      );

      return;
    }

    setGuardando(true);
    setErrores({});
    setExito("");

    try {
      const body: Record<string, unknown> = {
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        username: datos.username.trim(),
        avatar: datos.avatar,
      };

      if (!google && datos.correo.trim() !== usuario.correo) {
        body.correo = datos.correo.trim();
      }

      const actualizado = await apiFetch<Usuario>(
        "/api/v1/users/me",
        {
          method: "PATCH",
          body,
        }
      );

      perfilListo(actualizado);
      setDatos(desdeUsuario(actualizado));
      setExito("Cambios guardados.");
    } catch (error) {
      setErrores(erroresServidor(error));

      requestAnimationFrame(() =>
        formularioRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus()
      );
    } finally {
      setGuardando(false);
    }
  }

  if (!usuario || !datos) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-3 text-3xl font-bold">Mi perfil</h1>
        <p className="text-suave">Revisa y actualiza tus datos.</p>

        <div
          role="status"
          className="tarjeta mt-5 animate-pulse p-6"
        >
          Conectando… Cargando tu perfil…
          <div className="mt-4 h-4 w-2/3 rounded bg-borde" />
          <div className="mt-3 h-4 w-full rounded bg-borde" />
        </div>
      </div>
    );
  }

  const pendiente =
    JSON.stringify(datos) !== JSON.stringify(desdeUsuario(usuario));

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="text-3xl font-bold">Mi perfil</h1>
      <p className="mb-5 text-suave">
        Revisa y actualiza tus datos.
      </p>

      {exito && (
        <p
          role="status"
          aria-live="polite"
          className="mb-4 rounded-lg bg-exito-fondo p-3 font-medium text-exito"
        >
          ✓ {exito}
        </p>
      )}

      {errores.general && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-error p-3 text-error"
        >
          {errores.general}
        </p>
      )}

      <form
        ref={formularioRef}
        noValidate
        onSubmit={(e) => void guardar(e)}
        className="tarjeta space-y-4 bg-superficie p-4 sm:p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar
            nombre={`${datos.nombres} ${datos.apellidos}`}
            color={datos.avatar}
            tam={56}
          />

          <div className="min-w-0 flex-1">
            <SelectorAvatar
              valor={datos.avatar}
              nombre={`${datos.nombres} ${datos.apellidos}`}
              onCambio={(avatar) => {
                setDatos((d) => (d ? { ...d, avatar } : d));
                setExito("");
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            id="perfil-nombres"
            etiqueta="Nombres"
            requerido
            autoComplete="given-name"
            value={datos.nombres}
            onChange={(e) => modificar("nombres", e.target.value)}
            error={errores.nombres}
          />

          <Campo
            id="perfil-apellidos"
            etiqueta="Apellidos"
            requerido
            autoComplete="family-name"
            value={datos.apellidos}
            onChange={(e) => modificar("apellidos", e.target.value)}
            error={errores.apellidos}
          />
        </div>

        <Campo
          id="perfil-username"
          etiqueta="Nombre de usuario"
          requerido
          ayuda="De 3 a 20 letras, números o guion bajo."
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={datos.username}
          onChange={(e) => modificar("username", e.target.value)}
          error={errores.username}
        />

        <Campo
          id="perfil-correo"
          etiqueta="Correo electrónico"
          requerido
          type="email"
          autoComplete="email"
          readOnly={google}
          aria-readonly={google}
          ayuda={
            google
              ? "Ingresaste con Google; el correo no se puede cambiar aquí."
              : undefined
          }
          value={datos.correo}
          onChange={(e) => modificar("correo", e.target.value)}
          error={errores.correo}
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={guardando || !pendiente}
            className="btn-principal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>

          <button
            type="button"
            disabled={guardando}
            onClick={cancelar}
            className="btn-secundario"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
