import { createUserWithEmailAndPassword } from "firebase/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, apiFetch } from "../api";
import { Avatar } from "../components/Avatar";
import { Campo } from "../components/Campo";
import { auth } from "../firebase";
import { useTitulo } from "../hooks/useTitulo";
import { SIN_FIREBASE, traducirErrorAuth } from "../sesion/erroresAuth";
import { useSesion } from "../sesion/SesionContext";
import { PATRON_USERNAME, type DatosRegistro, type Usuario } from "../tipos";

const NOMBRES_AVATAR = ["Morado", "Verde", "Magenta", "Turquesa", "Rojo", "Ámbar"];

type CampoRegistro = "nombres" | "apellidos" | "username" | "correo" | "clave";
type Errores = Partial<Record<CampoRegistro | "general", string>>;

const CAMPOS_API: readonly string[] = ["nombres", "apellidos", "username"];

// Convierte un error de la API en errores del formulario.
function erroresDeApi(error: unknown): Errores {
  if (!(error instanceof ApiError)) return { general: "No pudimos crear tu cuenta. Inténtalo de nuevo." };
  if (error.code === "USERNAME_TAKEN") return { username: error.message };
  if (error.code === "EMAIL_TAKEN") return { correo: error.message };
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

// Registro manual (TS-01): crea la cuenta en Firebase Auth y luego el perfil con POST /api/v1/users.
// La unicidad del nombre de usuario y del correo la decide el servidor.
export function Registro() {
  useTitulo("Registro");
  const { perfilListo } = useSesion();
  const navegar = useNavigate();
  const formulario = useRef<HTMLFormElement>(null);

  const [valores, setValores] = useState({ nombres: "", apellidos: "", username: "", correo: "", clave: "" });
  const [avatar, setAvatar] = useState(0);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (intentos > 0) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  const cambiar = (campo: keyof typeof valores) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const n: Errores = {};
    if (!valores.nombres.trim()) n.nombres = "Escribe tus nombres.";
    if (!valores.apellidos.trim()) n.apellidos = "Escribe tus apellidos.";
    const usuario = valores.username.trim();
    if (!usuario) n.username = "Elige un nombre de usuario.";
    else if (!PATRON_USERNAME.test(usuario))
      n.username = "Usa de 3 a 20 letras, números o guion bajo, sin espacios.";
    if (!valores.correo.trim()) n.correo = "Escribe tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(valores.correo.trim())) n.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (!valores.clave) n.clave = "Elige una contraseña.";
    else if (valores.clave.length < 8 || !/[A-Za-z]/.test(valores.clave) || !/\d/.test(valores.clave))
      n.clave = "La contraseña debe tener al menos 8 caracteres, con letras y números.";
    if (Object.keys(n).length === 0 && !auth) n.general = SIN_FIREBASE;

    setErrores(n);
    setIntentos((x) => x + 1);
    if (Object.keys(n).length > 0 || !auth) return;

    const correo = valores.correo.trim();
    const datos: DatosRegistro = { nombres: valores.nombres.trim(), apellidos: valores.apellidos.trim(), username: usuario, avatar };

    setEnviando(true);
    try {
      // Si un intento anterior ya creó la cuenta (y falló el perfil, p. ej. usuario ocupado), no se crea otra vez.
      const actual = auth.currentUser;
      if (!actual || actual.email?.toLowerCase() !== correo.toLowerCase()) {
        try {
          await createUserWithEmailAndPassword(auth, correo, valores.clave);
        } catch (error) {
          const { campo, mensaje } = traducirErrorAuth(error);
          setErrores({ [campo]: mensaje });
          setIntentos((x) => x + 1);
          return;
        }
      }
      try {
        const perfil = await apiFetch<Usuario>("/api/v1/users", { method: "POST", body: datos });
        perfilListo(perfil);
        navegar("/salas", { replace: true });
      } catch (error) {
        setErrores(erroresDeApi(error));
        setIntentos((x) => x + 1);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">Crea tu cuenta</h1>
      <p className="mb-6 text-suave">Para entrar a tus salas de estudio.</p>

      <form ref={formulario} onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
        {errores.general && (
          <p role="alert" className="flex items-center gap-1 font-bold text-error">
            <span aria-hidden="true">⚠</span> {errores.general}
          </p>
        )}
        <Campo id="nombres" etiqueta="Nombres" autoComplete="given-name" value={valores.nombres} onChange={cambiar("nombres")} error={errores.nombres} />
        <Campo id="apellidos" etiqueta="Apellidos" autoComplete="family-name" value={valores.apellidos} onChange={cambiar("apellidos")} error={errores.apellidos} />
        <Campo
          id="username"
          etiqueta="Nombre de usuario"
          autoComplete="username"
          value={valores.username}
          onChange={cambiar("username")}
          error={errores.username}
          ayuda="De 3 a 20 letras, números o guion bajo."
        />
        <Campo id="correo" etiqueta="Correo electrónico" type="email" autoComplete="email" value={valores.correo} onChange={cambiar("correo")} error={errores.correo} />
        <Campo
          id="clave"
          etiqueta="Contraseña"
          type="password"
          autoComplete="new-password"
          value={valores.clave}
          onChange={cambiar("clave")}
          error={errores.clave}
          ayuda="Mínimo 8 caracteres, con letras y números."
        />

        <fieldset>
          <legend className="mb-2 font-bold">Elige tu avatar</legend>
          <div className="flex flex-wrap gap-3">
            {NOMBRES_AVATAR.map((nombre, i) => (
              <label key={nombre} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatar"
                  value={i}
                  checked={avatar === i}
                  onChange={() => setAvatar(i)}
                  className="peer sr-only"
                />
                <span className="block rounded-full p-0.5 peer-checked:ring-4 peer-checked:ring-enlace peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-enlace">
                  <Avatar nombre={valores.nombres || "Tú"} color={i} tam={40} />
                </span>
                <span className="sr-only">{nombre}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn-principal" disabled={enviando} aria-busy={enviando}>
          Crear cuenta
        </button>
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
