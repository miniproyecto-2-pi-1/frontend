import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BotonGoogle, SeparadorO } from "../components/BotonGoogle";
import { Campo } from "../components/Campo";
import { auth } from "../firebase";
import { useTitulo } from "../hooks/useTitulo";
import { esErrorDeRed, SIN_FIREBASE, traducirErrorAuth } from "../sesion/erroresAuth";
import { useSesion } from "../sesion/SesionContext";
import { useIngresoGoogle } from "../sesion/useIngresoGoogle";
import { IconoError } from "../components/IconoError";

interface Errores {
  correo?: string;
  clave?: string;
  general?: string;
}

// Ingreso con correo y contraseña (US-03) o con Google (US-02). Referencia visual: docs/prototipo/ingreso-*.
// Cuando la sesión queda lista vuelve a la ruta privada que se pidió (guardada por RutaPrivada) o a /salas;
// si falta el nombre de usuario, va a /elegir-username.
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
  const [sinRed, setSinRed] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);
  const alerta = useRef<HTMLDivElement>(null);
  const google = useIngresoGoogle();

  // Tras un intento fallido, el foco va al primer campo con error; si el error es general, al aviso.
  useEffect(() => {
    if (intentos === 0) return;
    const campo = formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (campo) campo.focus();
    else alerta.current?.focus();
  }, [intentos]);

  // Sirve para el correo, para Google y para quien ya tenía sesión y abre /ingreso.
  // Sin perfil, va a elegir el nombre de usuario y conserva la ruta de origen para después.
  useEffect(() => {
    if (estado === "listo") navegar(desde, { replace: true });
    else if (estado === "sinUsername") navegar("/elegir-username", { replace: true, state: { desde } });
  }, [estado, desde, navegar]);

  function mostrarErrores(n: Errores, red = false) {
    setErrores(n);
    setSinRed(red);
    setIntentos((x) => x + 1);
  }

  async function enviar(e?: FormEvent) {
    e?.preventDefault();
    if (enviando || google.ocupado) return; // el botón usa aria-disabled para no perder el foco
    // Se valida antes de enviar: el formato del correo se marca en su campo.
    const nuevos: Errores = {};
    if (!correo.trim()) nuevos.correo = "Escribe tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) nuevos.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (!clave) nuevos.clave = "Escribe tu contraseña.";
    if (Object.keys(nuevos).length === 0 && !auth) nuevos.general = SIN_FIREBASE;
    if (Object.keys(nuevos).length > 0 || !auth) {
      mostrarErrores(nuevos);
      return;
    }
    setErrores({});
    setSinRed(false);

    setEnviando(true);
    try {
      // Si funciona, onAuthStateChanged actualiza la sesión y el efecto de arriba navega.
      await signInWithEmailAndPassword(auth, correo.trim(), clave);
    } catch (error) {
      const traducido = traducirErrorAuth(error);
      // Credenciales incorrectas, demasiados intentos y red van en el aviso general, sin marcar campos.
      mostrarErrores({ [traducido.campo]: traducido.mensaje }, esErrorDeRed(traducido));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md sm:pt-6">
      <form
        ref={formulario}
        onSubmit={enviar}
        className="tarjeta flex flex-col gap-5 p-4 sm:p-8"
        noValidate
        aria-labelledby="titulo-ingreso"
        aria-describedby={errores.general ? "ingreso-error" : undefined}
      >
        <div>
          <h1 id="titulo-ingreso" className="mb-1 text-3xl font-bold">
            ¡Qué bueno verte!
          </h1>
          <p className="text-suave">Entra y estudia con tu grupo.</p>
        </div>

        {errores.general && (
          <div
            id="ingreso-error"
            ref={alerta}
            role="alert"
            tabIndex={-1}
            className="rounded-lg border-[1.5px] border-error bg-fondo p-3 text-error"
          >
            <p className="flex items-start gap-1.5 font-medium">
              <IconoError />
              <span>{errores.general}</span>
            </p>
            {sinRed && (
              <button type="button" onClick={() => void enviar()} className="mt-2 font-bold text-enlace underline">
                Reintentar
              </button>
            )}
          </div>
        )}

        <Campo
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          error={errores.correo}
        />
        <Campo
          id="clave"
          etiqueta="Contraseña"
          type={verClave ? "text" : "password"}
          autoComplete="current-password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          error={errores.clave}
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
          {enviando ? "Ingresando…" : "Entrar"}
        </button>

        <SeparadorO />
        <BotonGoogle google={google} deshabilitado={enviando} />

        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-bold text-enlace underline">
            Crea tu cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
