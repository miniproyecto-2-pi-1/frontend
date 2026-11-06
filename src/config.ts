// URL base de la API. En producción (Vercel) se define con la variable VITE_API_URL.
// Si no existe, se usa la API local; nunca hay claves aquí: el frontend no lee Firestore, solo la API.
export const API_URL: string = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
