import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase en el cliente se usa SOLO para autenticación (getAuth).
// El frontend nunca lee ni escribe Firestore: todos los datos pasan por la API.
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Si falta alguna variable no se inicializa Firebase: getAuth lanzaría un error y dejaría la
// aplicación en blanco. Sin configuración, la sesión queda como "anónimo" y el ingreso avisa del problema.
export const firebaseConfigurado: boolean = Object.values(config).every((valor) => Boolean(valor));

export const auth: Auth | null = firebaseConfigurado ? getAuth(initializeApp(config)) : null;
