// Traduce los errores de Firebase Auth a mensajes para el usuario y al campo del formulario que corresponde.
export interface ErrorAuth {
  campo: "correo" | "clave" | "general";
  mensaje: string;
}

function codigo(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "";
}

export function traducirErrorAuth(error: unknown): ErrorAuth {
  switch (codigo(error)) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return { campo: "general", mensaje: "Correo o contraseña incorrectos." };
    case "auth/invalid-email":
      return { campo: "correo", mensaje: "Escribe un correo válido, por ejemplo nombre@correo.com." };
    case "auth/email-already-in-use":
      return { campo: "correo", mensaje: "Este correo ya está registrado." };
    case "auth/weak-password":
      return { campo: "clave", mensaje: "La contraseña debe tener al menos 8 caracteres, con letras y números." };
    case "auth/user-disabled":
      return { campo: "general", mensaje: "Esta cuenta está deshabilitada." };
    case "auth/too-many-requests":
      return { campo: "general", mensaje: "Hiciste demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
    case "auth/network-request-failed":
      return { campo: "general", mensaje: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo." };
    default:
      return { campo: "general", mensaje: "No pudimos completar la operación. Inténtalo de nuevo." };
  }
}

export const SIN_FIREBASE = "El ingreso no está disponible: falta la configuración de Firebase (revisa .env.local).";
