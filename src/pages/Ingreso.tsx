import { signInWithEmailAndPassword } from "firebase/auth";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import {BotonGoogle,SeparadorO} from "../components/BotonGoogle";
import { Campo } from "../components/Campo";
import { IconoError } from "../components/IconoError";
import { auth } from "../firebase";
import { useTitulo } from "../hooks/useTitulo";
import {esErrorDeRed,SIN_FIREBASE,traducirErrorAuth} from "../sesion/erroresAuth";
import { useSesion } from "../sesion/SesionContext";
import { useIngresoGoogle } from "../sesion/useIngresoGoogle";

interface Errores {
  correo?: string;
  clave?: string;
  general?: string;
}

export function Ingreso() {
  useTitulo("Ingreso");

  const { estado } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const estadoRuta = ubicacion.state as {
    desde?: string;
    correo?: string;
    aviso?: string;
  } | null;

  const desde = estadoRuta?.desde ?? "/salas";

  const [correo, setCorreo] = useState(
    estadoRuta?.correo ?? ""
  );

  const [clave, setClave] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [sinRed, setSinRed] = useState(false);
  const [intentos, setIntentos] = useState(0);
  const [enviando, setEnviando] = useState(false);

  const formulario = useRef<HTMLFormElement>(null);
  const alerta = useRef<HTMLDivElement>(null);

  const google = useIngresoGoogle();

  useEffect(() => {
    if (intentos === 0) return;

    const campo =
      formulario.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]'
      );

    if (campo) {
      campo.focus();
    } else {
      alerta.current?.focus();
    }
  }, [intentos]);

  useEffect(() => {
    if (estado === "listo") {
      navegar(desde, {
        replace: true,
      });
    } else if (estado === "sinUsername") {
      navegar("/elegir-username", {
        replace: true,
        state: { desde },
      });
    }
  }, [estado, desde, navegar]);

  function mostrarErrores(
    nuevos: Errores,
    red = false
  ) {
    setErrores(nuevos);
    setSinRed(red);
    setIntentos((x) => x + 1);
  }

  async function enviar(e?: FormEvent) {
    e?.preventDefault();

    if (enviando || google.ocupado) return;

    const nuevos: Errores = {};

    if (!correo.trim()) {
      nuevos.correo =
        "Escribe tu correo electrónico.";
    } else if (
      !/^\S+@\S+\.\S+$/.test(correo.trim())
    ) {
      nuevos.correo =
        "Escribe un correo válido, por ejemplo nombre@correo.com.";
    }

    if (!clave) {
      nuevos.clave =
        "Escribe tu contraseña.";
    }

    if (
      Object.keys(nuevos).length === 0 &&
      !auth
    ) {
      nuevos.general = SIN_FIREBASE;
    }

    if (
      Object.keys(nuevos).length > 0 ||
      !auth
    ) {
      mostrarErrores(nuevos);
      return;
    }

    setErrores({});
    setSinRed(false);
    setEnviando(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        correo.trim(),
        clave
      );
    } catch (error) {
      const traducido = traducirErrorAuth(error);

      mostrarErrores(
        {
          [traducido.campo]: traducido.mensaje,
        },
        esErrorDeRed(traducido)
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col [@media(min-width:640px)_and_(min-height:700px)]:min-h-[calc(100dvh-12rem)] [@media(min-width:640px)_and_(min-height:700px)]:justify-center">
      <form
        ref={formulario}
        onSubmit={enviar}
        className="tarjeta flex flex-col gap-5 p-4 sm:p-8"
        noValidate
        aria-labelledby="titulo-ingreso"
        aria-describedby={
          errores.general
            ? "ingreso-error"
            : undefined
        }
      >
        <div>
          <h1
            id="titulo-ingreso"
            className="mb-1 text-3xl font-bold"
          >
            ¡Qué bueno verte!
          </h1>

          <p className="text-suave">
            Entra y estudia con tu grupo.
          </p>
        </div>

        {estadoRuta?.aviso && (
          <p
            role="status"
            className="rounded-lg bg-exito-fondo p-3 font-medium text-exito"
          >
            ✓ {estadoRuta.aviso}
          </p>
        )}

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
              <span>
                {errores.general}
              </span>
            </p>

            {sinRed && (
              <button
                type="button"
                onClick={() => void enviar()}
                className="mt-2 font-bold text-enlace underline"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        <p className="text-suave">
          Todos los campos son obligatorios.
        </p>

        <Campo
          requerido
          id="correo"
          etiqueta="Correo electrónico"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          value={correo}
          onChange={(e) =>
            setCorreo(e.target.value)
          }
          error={errores.correo}
        />

        <Campo
          requerido
          id="clave"
          etiqueta="Contraseña"
          type={
            verClave
              ? "text"
              : "password"
          }
          autoComplete="current-password"
          value={clave}
          onChange={(e) =>
            setClave(e.target.value)
          }
          error={errores.clave}
          accion={
            <button
              type="button"
              onClick={() =>
                setVerClave((v) => !v)
              }
              aria-controls="clave"
              className="min-h-10 rounded-md px-3 font-bold text-enlace"
            >
              {verClave
                ? "Ocultar"
                : "Mostrar"}

              <span className="sr-only">
                {" "}contraseña
              </span>
            </button>
          }
        />

        <button
          type="submit"
          className="btn-principal w-full aria-disabled:cursor-wait aria-disabled:opacity-80"
          aria-disabled={
            enviando || google.ocupado
          }
          aria-busy={enviando}
        >
          {enviando && (
            <span
              aria-hidden="true"
              className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}

          {enviando
            ? "Ingresando…"
            : "Entrar"}
        </button>

        <p
          role="status"
          className="sr-only"
        >
          {enviando
            ? "Ingresando…"
            : ""}
        </p>

        <SeparadorO />

        <BotonGoogle
          google={google}
          deshabilitado={enviando}
        />

        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <Link
            to="/registro"
            className="font-bold text-enlace underline"
          >
            Crea tu cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}
