// Traduce los errores de Firebase Auth a mensajes para el usuario y al campo del formulario que corresponde.
export interface ErrorAuth {
  campo: "correo" | "clave" | "general";
  mensaje: string;
  codigo: string; // código original de Firebase, por ejemplo "auth/email-already-in-use"
}

function codigo(error: unknown): string {
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" ? error.code : "";
}

export function traducirErrorAuth(error: unknown): ErrorAuth {
  const c = codigo(error);
  return { ...mensajeDe(c), codigo: c };
}

function mensajeDe(c: string): Omit<ErrorAuth, "codigo"> {
  switch (c) {
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
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return { campo: "general", mensaje: "Cerraste la ventana de Google antes de terminar. Puedes intentarlo de nuevo." };
    case "auth/popup-blocked":
      return {
        campo: "general",
        mensaje: "Tu navegador no dejó abrir la ventana de Google. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.",
      };
    case "auth/account-exists-with-different-credential":
      return { campo: "general", mensaje: "Ya existe una cuenta con este correo. Ingresa con tu correo y contraseña." };
    case "auth/unauthorized-domain":
    case "auth/operation-not-allowed":
      return { campo: "general", mensaje: "El ingreso con Google no está disponible en este momento. Usa tu correo y contraseña." };
    case "auth/network-request-failed":
      return { campo: "general", mensaje: "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo." };
    default:
      return { campo: "general", mensaje: "No pudimos completar la operación. Inténtalo de nuevo." };
  }
}

export const SIN_FIREBASE = "El ingreso no está disponible: falta la configuración de Firebase (revisa .env.local).";
