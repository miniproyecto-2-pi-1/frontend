import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { Campo } from "../components/Campo";
import { useTitulo } from "../hooks/useTitulo";
import { useSesion } from "../sesion/SesionContext";

const NOMBRES_AVATAR = ["Morado", "Verde", "Magenta", "Turquesa", "Rojo", "Ámbar"];

type Errores = Partial<Record<"nombres" | "apellidos" | "username" | "correo" | "clave", string>>;

// Registro de demostración (Sprint 0). El nombre de usuario «admin» muestra el error de usuario ya ocupado.
// El registro real (Firebase Auth, Firestore y unicidad en el servidor) llega en el Sprint 1.
export function Registro() {
  useTitulo("Registro");
  const { ingresar } = useSesion();
  const navegar = useNavigate();
  const formulario = useRef<HTMLFormElement>(null);

  const [valores, setValores] = useState({ nombres: "Camila", apellidos: "Torres", username: "camila_t", correo: "camila.torres@correounivalle.edu.co", clave: "ejemplo123" });
  const [avatar, setAvatar] = useState(0);
  const [errores, setErrores] = useState<Errores>({});
  const [intentos, setIntentos] = useState(0);

  useEffect(() => {
    if (intentos > 0) formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [intentos]);

  const cambiar = (campo: keyof typeof valores) => (e: { target: { value: string } }) =>
    setValores((v) => ({ ...v, [campo]: e.target.value }));

  function enviar(e: FormEvent) {
    e.preventDefault();
    const n: Errores = {};
    if (!valores.nombres.trim()) n.nombres = "Escribe tus nombres.";
    if (!valores.apellidos.trim()) n.apellidos = "Escribe tus apellidos.";
    const usuario = valores.username.trim();
    if (!usuario) n.username = "Elige un nombre de usuario.";
    else if (!/^[A-Za-z0-9_]{3,20}$/.test(usuario))
      n.username = "Usa de 3 a 20 letras, números o guion bajo, sin espacios.";
    else if (usuario.toLowerCase() === "admin") n.username = "Ese nombre de usuario ya existe. Elige otro.";
    if (!valores.correo.trim()) n.correo = "Escribe tu correo electrónico.";
    else if (!/^\S+@\S+\.\S+$/.test(valores.correo.trim())) n.correo = "Escribe un correo válido, por ejemplo nombre@correo.com.";
    if (!valores.clave) n.clave = "Elige una contraseña.";
    else if (valores.clave.length < 8 || !/[A-Za-z]/.test(valores.clave) || !/\d/.test(valores.clave))
      n.clave = "La contraseña debe tener al menos 8 caracteres, con letras y números.";

    setErrores(n);
    setIntentos((x) => x + 1);
    if (Object.keys(n).length > 0) return;

    const nuevo = {
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      username: usuario,
      correo: valores.correo.trim(),
      avatar,
    };
    try {
      localStorage.setItem("usuarioDemo", JSON.stringify(nuevo));
    } catch {
      /* sin almacenamiento, el usuario solo dura esta visita */
    }
    ingresar(nuevo);
    navegar("/salas", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-3xl font-bold">Crea tu cuenta</h1>
      <p className="mb-6 text-suave">Para entrar a tus salas de estudio.</p>

      <form ref={formulario} onSubmit={enviar} className="tarjeta flex flex-col gap-4" noValidate>
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

        <button type="submit" className="btn-principal">
          Crear cuenta
        </button>
        <p className="text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/ingreso" className="text-enlace underline">
            Inicia sesión
          </Link>
        </p>
      </form>

      <p className="mt-4 text-sm text-suave">
        Demostración del Sprint 0: ya hay datos de ejemplo escritos, solo pulsa Crear cuenta. Para ver el error de usuario
        ocupado, escribe el nombre de usuario «admin». El registro real se activa en el Sprint 1.
      </p>
    </div>
  );
}
