// Hora corta de un mensaje, en 24 horas (por ejemplo «10:03»).
export function horaCorta(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });
}
