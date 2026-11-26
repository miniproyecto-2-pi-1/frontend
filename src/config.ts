// URL base de la API. En producción (Vercel) se define con la variable VITE_API_URL.
// Si no existe, se usa la API local; nunca hay claves aquí: el frontend no lee Firestore, solo la API.
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

// URL del servidor de tiempo real (Socket.IO). En producción se define con VITE_REALTIME_URL.
// Si no existe, se usa el servidor local (backend-realtime escucha en el puerto 4000).
export const REALTIME_URL: string = (import.meta.env.VITE_REALTIME_URL ?? "http://localhost:4000").replace(/\/$/, "");
