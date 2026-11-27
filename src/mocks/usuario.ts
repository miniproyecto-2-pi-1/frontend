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

// Clave de localStorage donde el modo mock guarda los perfiles (también el de la sesión simulada tras editarlo).
export const CLAVE_USUARIOS = "mockUsuarios";

// El perfil de la sesión simulada: el guardado tras editarlo en «Mi perfil», o el de ejemplo.
export function usuarioMock(): Usuario {
  try {
    const texto = localStorage.getItem(CLAVE_USUARIOS);
    const guardados = texto ? (JSON.parse(texto) as Usuario[]) : [];
    return guardados.find((u) => u.uid === USUARIO_MOCK.uid) ?? USUARIO_MOCK;
  } catch {
    return USUARIO_MOCK;
  }
}
