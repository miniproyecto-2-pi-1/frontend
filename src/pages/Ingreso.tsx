import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Campo } from "../components/Campo";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion, type Usuario } from "../sesion/SesionContext";

interface Errores {
  correo?: string;
  clave?: string;
  general?: string;
}

// Ingreso de demostración (Sprint 0): sirve cualquier correo y contraseña válidos.
// La contraseña «error» muestra el mensaje de credenciales incorrectas. El ingreso real llega en el Sprint 1.
export function Ingreso() {
  useTitulo("Ingreso");
  const { ingresar } = useSesion();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const desde = (ubicacion.state as { desde?: string } | null)?.desde ?? "/salas";

  const [correo, setCorreo] = useState("camila.torres@correounivalle.edu.co");
  const [clave, setClave] = useState("ejemplo123");
  const [verClave, setVerClave] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);
  const formulario = useRef<HTMLFormElement>(null);

  // Tras un intento fallido, el foco va al primer campo con error.
  useEffect(() => {
    if (intentos > 0) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  function enviar(e: FormEvent) {
    e.preventDefault();
    const nuevos: Errores = {};
    if (!correo.trim()) nuevos.correo = "Escribe tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(correo.trim())) nuevos.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (!clave) nuevos.clave = "Escribe tu contraseña.";
    if (!nuevos.correo && !nuevos.clave && clave === "error") nuevos.general = "Correo o contraseña incorrectos.";
    setErrores(nuevos);
    setIntentos((n) => n + 1);
    if (Object.keys(nuevos).length > 0) return;

    let usuario: Usuario | null = null;
    try {
      const guardado = localStorage.getItem("usuarioDemo");
      const registrado = guardado ? (JSON.parse(guardado) as Usuario) : null;
      if (registrado && registrado.correo === correo.trim()) usuario = registrado;
    } catch {
      /* se usa el usuario de ejemplo */
    }
    if (!usuario) {
      const nombre = correo.trim().split("@")[0];
      usuario = { nombres: "Estudiante", apellidos: "", username: nombre, correo: correo.trim(), avatar: 0 };
    }
    ingresar(usuario);
    navegar(desde, { replace: true });
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
        <button type="submit" className="btn-principal">
          Ingresar
        </button>
        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-enlace underline">
            Crea tu cuenta
          </Link>
        </p>
      </form>

      <p className="mt-4 text-sm text-suave">
        Demostración del Sprint 0: ya hay datos de ejemplo escritos, solo pulsa Ingresar. Sirve cualquier correo y contraseña; para
        ver el mensaje de error, escribe la contraseña «error». El ingreso real se activa en el Sprint 1.
      </p>
    </div>
  );
}
