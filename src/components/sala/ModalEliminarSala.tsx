import { useState, type RefObject } from "react";
import { ApiError, apiFetch } from "../../api";
import { ModalAccesible } from "../ModalAccesible";

interface Props {
  sala: { id: string; nombre: string };
  // Botón que abrió la ventana: al cerrarla sin eliminar, el foco vuelve a él.
  iniciadorRef: RefObject<HTMLButtonElement | null>;
  alCerrar: () => void;
  alEliminada: () => void;
}

// Confirmación para eliminar una sala (US-07). Se pide confirmar porque no se puede deshacer.
// Solo lo puede hacer el anfitrión; la API responde 403 a cualquier otra persona.
export function ModalEliminarSala({ sala, iniciadorRef, alCerrar, alEliminada }: Props) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  async function eliminar() {
    if (eliminando) return;
    setEliminando(true);
    setError("");
    try {
      await apiFetch<null>(`/api/v1/rooms/${encodeURIComponent(sala.id)}`, { method: "DELETE" });
      alEliminada();
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.code === "ROOM_NOT_FOUND")) {
        alEliminada(); // ya no existía: el resultado es el mismo que se buscaba
        return;
      }
      if (e instanceof ApiError && (e.status === 403 || e.code === "FORBIDDEN")) {
        setError("Solo el anfitrión puede eliminar la sala.");
      } else {
        setError("No pudimos eliminar la sala. Revisa tu conexión e inténtalo de nuevo.");
      }
      setEliminando(false);
    }
  }

  return (
    <ModalAccesible
      titulo={`¿Eliminar la sala «${sala.nombre}»?`}
      descripcion="Se borrarán la sala y todo su chat. Las personas que estén conectadas recibirán un aviso y volverán a Mis salas. Esta acción no se puede deshacer."
      alCerrar={alCerrar}
      ocupado={eliminando}
      iniciadorRef={iniciadorRef}
    >
      {error && (
        <p role="alert" className="mb-3 rounded-lg bg-error-fondo p-3 font-medium text-error">
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-2">
        {/* El foco empieza en «Cancelar»: es la opción segura. */}
        <button type="button" data-foco-inicial className="btn-secundario" disabled={eliminando} onClick={alCerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn-principal border-[#b3261e] bg-[#b3261e] disabled:opacity-60"
          disabled={eliminando}
          onClick={() => void eliminar()}
        >
          {eliminando ? "Eliminando…" : "Eliminar sala"}
        </button>
      </div>
    </ModalAccesible>
  );
}
