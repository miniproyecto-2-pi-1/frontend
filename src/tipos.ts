// Contrato de la API de usuarios (TS-01). La API identifica al usuario por su idToken de Firebase,
// así que el uid y el correo nunca se envían en el cuerpo: salen del token.

// Perfil que devuelve GET /api/v1/users/me (y los POST que crean o completan el perfil).
export interface Usuario {
  uid: string;
  nombres: string;
  apellidos: string;
  username: string;
  correo: string;
  avatar: number; // índice del color del avatar (0 a 5)
}

// Cuerpo de POST /api/v1/users: registro manual, justo después de crear la cuenta en Firebase.
export interface DatosRegistro {
  nombres: string;
  apellidos: string;
  username: string;
  avatar: number;
}

// Cuerpo de POST /api/v1/users/me/username: completar el perfil (por ejemplo, tras ingresar con Google).
export interface DatosUsername {
  username: string;
}

export const PATRON_USERNAME = /^[A-Za-z0-9_]{3,20}$/;
export const TOTAL_AVATARES = 6;
