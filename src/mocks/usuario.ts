import type { Usuario } from "../tipos";

// Persona que «ingresa» en el modo mock con sesión simulada (VITE_MOCK_SESION=true).
export const USUARIO_MOCK: Usuario = {
  uid: "mock-camila",
  nombres: "Camila",
  apellidos: "Torres",
  username: "camila",
  correo: "camila@correo.com",
  avatar: 0,
};
