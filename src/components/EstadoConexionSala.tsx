import type { EstadoConexion } from "../tiempoReal";

// Indicador de la conexión con la sala. El estado se escribe con palabras: el color no es la única señal (WCAG 1.4.1).
export function EstadoConexionSala({ estado, unida }: { estado: EstadoConexion; unida: boolean }) {
  const conectado = estado === "conectado" && unida;
  const texto = conectado
    ? "Conectado"
    : estado === "sin-conexion"
      ? "Sin conexión"
      : estado === "reconectando"
        ? "Reconectando…"
        : "Conectando…";
  const color = conectado
    ? "bg-exito-fondo text-exito"
    : estado === "sin-conexion"
      ? "bg-error-fondo text-error"
      : "bg-superficie text-suave";
  const punto = conectado ? "bg-exito" : estado === "sin-conexion" ? "bg-error" : "bg-suave";

  // Estando conectado no se muestra nada: ya se sabe. Solo aparece cuando algo no va bien (conectando, reconectando
  // o sin conexión). La región «status» queda siempre, para que el lector de pantalla anuncie el cambio.
  return (
    <div role="status">
      {!conectado && (
        <p className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${color}`}>
          <span aria-hidden="true" className={`size-2 rounded-full ${punto}`} />
          {texto}
        </p>
      )}
    </div>
  );
}
