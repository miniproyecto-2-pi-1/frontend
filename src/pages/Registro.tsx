import { createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { BotonGoogle, SeparadorO } from "../components/BotonGoogle";
import { Campo } from "../components/Campo";
import { SelectorAvatar } from "../components/SelectorAvatar";
import { auth } from "../firebase";
import { useTitulo } from "../hooks/useTitulo";
import { SIN_FIREBASE, traducirErrorAuth } from "../sesion/erroresAuth";
import { useSesion } from "../sesion/SesionContext";
import { useIngresoGoogle } from "../sesion/useIngresoGoogle";
import { type DatosRegistro, type Usuario } from "../tipos";
import { validarApellidos, validarNombres, validarUsername } from "../validacion";
import { IconoError } from "../components/IconoError";

type CampoRegistro = "nombres" | "apellidos" | "username" | "correo" | "clave";
type Errores = Partial<Record<CampoRegistro | "general", string>>;

const CAMPOS_API: readonly string[] = ["nombres", "apellidos", "username"];
const CORREO_REGISTRADO = "Este correo ya está registrado.";

// Validación en el navegador: cada campo con su propio mensaje (US-01, datos inválidos).
function validar(v: Record<CampoRegistro, string>): Errores {
  const n: Errores = {};
  n.nombres = validarNombres(v.nombres);
  n.apellidos = validarApellidos(v.apellidos);
  n.username = validarUsername(v.username);
  const correo = v.correo.trim();
  if (!correo) n.correo = "Escribe tu correo electrónico.";
  else if (!/^\S+@\S+\.\S+$/.test(correo)) n.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
  if (!v.clave) n.clave = "Elige una contraseña.";
  else if (v.clave.length < 8 || !/[A-Za-z]/.test(v.clave) || !/\d/.test(v.clave))
    n.clave = "La contraseña debe tener al menos 8 caracteres, con letras y números.";
  // Solo quedan las claves con error, para poder contar los errores con Object.keys.
  return Object.fromEntries(Object.entries(n).filter(([, mensaje]) => mensaje)) as Errores;
}

// Convierte un error de la API en errores del formulario.
function erroresDeApi(error: unknown): Errores {
  if (!(error instanceof ApiError)) return { general: "No pudimos crear tu cuenta. Inténtalo de nuevo." };
  if (error.code === "USERNAME_TAKEN") return { username: error.message };
  if (error.code === "EMAIL_TAKEN") return { correo: CORREO_REGISTRADO };
  if (error.code === "VALIDATION" && error.fields) {
    const errores: Errores = {};
    for (const [campo, mensaje] of Object.entries(error.fields)) {
      if (CAMPOS_API.includes(campo)) errores[campo as CampoRegistro] = mensaje;
      else errores.general = mensaje;
    }
    return errores;
  }
  return { general: error.message };
}

// Registro manual (US-01): crea la cuenta en Firebase Auth y luego el perfil con POST /api/v1/users.
// Registro con Google (US-02): tras la ventana de Google, SesionContext decide si falta el username.
// La unicidad del nombre de usuario y del correo la decide el servidor.
// Referencia visual: docs/prototipo/registro-*.
export function Registro() {
  useTitulo("Registro");
  const { estado, perfilListo } = useSesion();
  const google = useIngresoGoogle();
  const navegar = useNavigate();
  const formulario = useRef<HTMLFormElement>(null);
  const alerta = useRef<HTMLParagraphElement>(null);

  const [valores, setValores] = useState<Record<CampoRegistro, string>>({ nombres: "", apellidos: "", username: "", correo: "", clave: "" });
  const [avatar, setAvatar] = useState(0);
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);

  // Solo tras Google: el registro manual pasa un momento por "sinUsername" (antes del POST) y no debe saltar.
  useEffect(() => {
    if (!google.autenticado) return;
    if (estado === "listo") navegar("/salas", { replace: true });
    else if (estado === "sinUsername") navegar("/elegir-username", { replace: true });
  }, [google.autenticado, estado, navegar]);

  // Tras un intento fallido, el foco va al primer campo con error; si solo hay error general, al aviso.
  useEffect(() => {
    if (intentos === 0) return;
    const campo = formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (campo) campo.focus();
    else alerta.current?.focus();
  }, [intentos]);

  const cambiar = (campo: CampoRegistro) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  function mostrarErrores(n: Errores) {
    setErrores(n);
    setIntentos((x) => x + 1);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando || google.ocupado) return; // el botón usa aria-disabled para no perder el foco
    const n = validar(valores);
    if (Object.keys(n).length === 0 && !auth) n.general = SIN_FIREBASE;
    if (Object.keys(n).length > 0 || !auth) {
      mostrarErrores(n);
      return;
    }
    setErrores({});

    const correo = valores.correo.trim();
    const datos: DatosRegistro = {
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      username: valores.username.trim(),
      avatar,
    };

    setEnviando(true);
    try {
      // Si un intento anterior ya creó la cuenta en Auth y falló el perfil (p. ej. 409 USERNAME_TAKEN),
      // no se vuelve a crear: se reintenta solo el POST.
      const actual = auth.currentUser;
      if (!actual || actual.email?.toLowerCase() !== correo.toLowerCase()) {
        try {
          await createUserWithEmailAndPassword(auth, correo, valores.clave);
        } catch (error) {
          const { campo, mensaje, codigo } = traducirErrorAuth(error);
          mostrarErrores({ [campo]: codigo === "auth/email-already-in-use" ? CORREO_REGISTRADO : mensaje });
          return;
        }
      }
      try {
        const perfil = await apiFetch<Usuario>("/api/v1/users", { method: "POST", body: datos });
        perfilListo(perfil);
        navegar("/salas", { replace: true });
      } catch (error) {
        mostrarErrores(erroresDeApi(error));
      }
    } finally {
      setEnviando(false);
    }
  }

  // Con el correo ya registrado se ofrece ir al ingreso, llevando el correo escrito (texto del prototipo).
  const errorCorreo =
    errores.correo === CORREO_REGISTRADO ? (
      <>
        {CORREO_REGISTRADO}{" "}
        <Link to="/ingreso" state={{ correo: valores.correo.trim() }} className="text-enlace underline">
          Inicia sesión
        </Link>
      </>
    ) : (
      errores.correo
    );

  return (
    <div className="mx-auto w-full max-w-xl">
      <h1 className="mb-1 text-3xl font-bold sm:text-center">Crea tu cuenta</h1>
      <p className="mb-6 text-suave sm:text-center">Para entrar a tus salas de estudio.</p>

      <form
        ref={formulario}
        onSubmit={enviar}
        className="tarjeta flex flex-col gap-5 p-4 sm:p-8"
        noValidate
        aria-describedby={errores.general ? "registro-error" : undefined}
      >
        {errores.general && (
          <p
            id="registro-error"
            ref={alerta}
            role="alert"
            tabIndex={-1}
            className="flex items-start gap-1.5 rounded-lg border-[1.5px] border-error bg-fondo p-3 font-medium text-error"
          >
            <IconoError />
            <span>{errores.general}</span>
          </p>
        )}

        <Campo
          id="nombres"
          etiqueta="Nombres"
          autoComplete="given-name"
          value={valores.nombres}
          onChange={cambiar("nombres")}
          error={errores.nombres}
        />
        <Campo
          id="apellidos"
          etiqueta="Apellidos"
          autoComplete="family-name"
          value={valores.apellidos}
          onChange={cambiar("apellidos")}
          error={errores.apellidos}
        />
        <Campo
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={valores.username}
          onChange={cambiar("username")}
          error={errores.username}
          ayuda="De 3 a 20 letras, números o guion bajo."
        />
        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={valores.correo}
          onChange={cambiar("correo")}
          error={errorCorreo}
        />
        <Campo
          id="clave"
          etiqueta="Contraseña"
          type={verClave ? "text" : "password"}
          autoComplete="new-password"
          value={valores.clave}
          onChange={cambiar("clave")}
          error={errores.clave}
          ayuda="Mínimo 8 caracteres, con letras y números."
          accion={
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              aria-pressed={verClave}
              aria-controls="clave"
              className="min-h-10 rounded-md px-3 font-bold text-enlace"
            >
              {verClave ? "Ocultar" : "Mostrar"}
              <span className="sr-only"> contraseña</span>
            </button>
          }
        />

        <SelectorAvatar valor={avatar} onCambio={setAvatar} nombre={valores.nombres} />

        <button
          type="submit"
          className="btn-principal w-full aria-disabled:cursor-wait aria-disabled:opacity-80"
          aria-disabled={enviando || google.ocupado}
          aria-busy={enviando}
        >
          {enviando && (
            <span
              aria-hidden="true"
              className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <SeparadorO />
        <BotonGoogle google={google} deshabilitado={enviando} />

        <p className="text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/ingreso" className="font-bold text-enlace underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
