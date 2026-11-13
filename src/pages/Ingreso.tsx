import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Campo } from "../components/Campo";
import { useTitulo } from "../hooks/useTitulo";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { SIN_FIREBASE, traducirErrorAuth } from "../sesion/erroresAuth";
import { useSesion } from "../sesion/SesionContext";

interface Errores {
  correo?: string;
  clave?: string;
  general?: string;
}

// Ingreso con correo y contraseña en Firebase Auth (TS-01). Cuando la sesión queda lista,
// vuelve a la ruta privada que se pidió; si falta el nombre de usuario, va a /elegir-username.
export function Ingreso() {
  useTitulo("Ingreso");
  const { estado } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const estadoRuta = ubicacion.state as { desde?: string; correo?: string } | null;
  const desde = estadoRuta?.desde ?? "/salas";

  // Desde el registro («Ir a iniciar sesión») llega el correo ya escrito.
  const [correo, setCorreo] = useState(estadoRuta?.correo ?? "");
  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);

  // Tras un intento fallido, el foco va al primer campo con error.
  useEffect(() => {
    if (intentos > 0) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  // También cubre a quien ya tenía sesión y abre /ingreso.
  useEffect(() => {
    if (estado === "listo") navegar(desde, { replace: true });
    else if (estado === "sinUsername") navegar("/elegir-username", { replace: true });
  }, [estado, desde, navegar]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos: Errores = {};
    if (!correo.trim()) nuevos.correo = "Escribe tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) nuevos.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (!clave) nuevos.clave = "Escribe tu contraseña.";
    if (!nuevos.correo && !nuevos.clave && !auth) nuevos.general = SIN_FIREBASE;
    setErrores(nuevos);
    setIntentos((n) => n + 1);
    if (Object.keys(nuevos).length > 0 || !auth) return;

    setEnviando(true);
    try {
      // Si funciona, onAuthStateChanged actualiza la sesión y el efecto de arriba navega.
      await signInWithEmailAndPassword(auth, correo.trim(), clave);
    } catch (error) {
      const { campo, mensaje } = traducirErrorAuth(error);
      setErrores({ [campo]: mensaje });
      setIntentos((n) => n + 1);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">¡Qué bueno verte!</h1>
      <p className="mb-6 text-suave">Entra y estudia con tu grupo.</p>

      <form ref={formulario} onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
        {errores.general && (
          <p role="alert" className="flex items-center gap-1 font-bold text-error">
            <span aria-hidden="true">⚠</span> {errores.general}
          </p>
        )}
        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={errores.correo}
        />
        <div>
          <Campo
            id="clave"
            etiqueta="Contraseña"
            type={verClave ? "text" : "password"}
            autoComplete="current-password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            error={errores.clave}
          />
          <button
            type="button"
            onClick={() => setVerClave((v) => !v)}
            aria-pressed={verClave}
            className="mt-2 text-enlace underline"
          >
            Mostrar contraseña
          </button>
        </div>
        <button type="submit" className="btn-principal" disabled={enviando} aria-busy={enviando}>
          Ingresar
        </button>
        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-enlace underline">
            Crea tu cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
