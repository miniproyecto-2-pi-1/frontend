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
  const color = conectado ? "text-exito" : estado === "sin-conexion" ? "text-error" : "text-suave";
  const punto = conectado ? "bg-exito" : estado === "sin-conexion" ? "bg-error" : "bg-suave";

  return (
    <p role="status" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${color}`}>
      <span aria-hidden="true" className={`size-2 rounded-full ${punto}`} />
      {texto}
    </p>
  );
}
