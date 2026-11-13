import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { auth } from "../firebase";
import { SIN_FIREBASE, traducirErrorAuth } from "./erroresAuth";
import { useSesion } from "./SesionContext";

// Ingreso y registro con Google (US-02). Este hook solo abre la ventana de Google:
// lo que pasa después lo decide SesionContext (GET /users/me → "listo" o "sinUsername")
// y la pantalla navega según ese estado.
export function useIngresoGoogle() {
  const { errorConexion, reintentar } = useSesion();
  const [abierta, setAbierta] = useState(false); // la ventana de Google está abierta
  const [autenticado, setAutenticado] = useState(false); // Google respondió; falta saber si tiene perfil
  const [error, setError] = useState<string | null>(null);

  async function continuarConGoogle() {
    setError(null);
    if (!auth) {
      setError(SIN_FIREBASE);
      return;
    }
    const proveedor = new GoogleAuthProvider();
    proveedor.setCustomParameters({ prompt: "select_account" }); // deja elegir la cuenta cada vez
    setAbierta(true);
    try {
      await signInWithPopup(auth, proveedor);
      setAutenticado(true);
    } catch (e) {
      setError(traducirErrorAuth(e).mensaje);
    } finally {
      setAbierta(false);
    }
  }

  // Si Google respondió pero la API no (servidor dormido o sin red), se muestra el error con «Reintentar».
  const errorServidor = autenticado && errorConexion ? errorConexion.message : null;

  return {
    continuarConGoogle,
    autenticado,
    ocupado: abierta || (autenticado && !errorServidor),
    error: error ?? errorServidor,
    puedeReintentar: Boolean(errorServidor),
    reintentar,
  };
}
