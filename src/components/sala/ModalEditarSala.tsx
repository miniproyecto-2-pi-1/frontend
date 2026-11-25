import { useRef, useState, type FormEvent, type RefObject } from "react";
import { ApiError, apiFetch } from "../../api";
import type { SalaDatos } from "../../tipos";
import { Campo } from "../Campo";
import { ModalAccesible } from "../ModalAccesible";

const MAXIMO_NOMBRE = 50;

interface Props {
  sala: { id: string; nombre: string };
  // Botón que abrió la ventana: al cerrarla, el foco vuelve a él.
  iniciadorRef: RefObject<HTMLButtonElement | null>;
  alCerrar: () => void;
  alGuardada: (sala: SalaDatos) => void;
}

// Editar el nombre de la sala (US-07). Solo lo puede hacer el anfitrión; la API responde 403 a cualquier otra persona.
export function ModalEditarSala({ sala, iniciadorRef, alCerrar, alGuardada }: Props) {
  const [nombre, setNombre] = useState(sala.nombre);
  const [errorNombre, setErrorNombre] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    if (guardando) return;

    const limpio = nombre.trim();
    if (limpio.length < 1 || limpio.length > MAXIMO_NOMBRE) {
      setErrorNombre(limpio ? `El nombre puede tener hasta ${MAXIMO_NOMBRE} caracteres.` : "Escribe un nombre para la sala.");
      entrada.current?.focus();
      return;
    }
    if (limpio === sala.nombre) {
      alCerrar(); // no hubo cambios
      return;
    }

    setGuardando(true);
    setErrorNombre("");
    setErrorGeneral("");
    try {
      const actualizada = await apiFetch<SalaDatos>(`/api/v1/rooms/${encodeURIComponent(sala.id)}`, {
        method: "PATCH",
        body: { nombre: limpio },
      });
      alGuardada({ ...actualizada, nombre: actualizada.nombre ?? limpio });
    } catch (error) {
      if (error instanceof ApiError && error.code === "VALIDATION" && error.fields?.nombre) {
        setErrorNombre(error.fields.nombre);
        entrada.current?.focus();
      } else if (error instanceof ApiError && (error.status === 403 || error.code === "FORBIDDEN")) {
        setErrorGeneral("Solo el anfitrión puede editar la sala.");
      } else if (error instanceof ApiError && (error.status === 404 || error.code === "ROOM_NOT_FOUND")) {
        setErrorGeneral("Esta sala ya no existe.");
      } else {
        setErrorGeneral("No pudimos guardar el cambio. Revisa tu conexión e inténtalo de nuevo.");
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ModalAccesible
      titulo="Editar sala"
      descripcion={`El ID de la sala (${sala.id}) no cambia.`}
      alCerrar={alCerrar}
      ocupado={guardando}
      iniciadorRef={iniciadorRef}
    >
      <form noValidate onSubmit={(e) => void guardar(e)}>
        <Campo
          id="nombre-sala-editar"
          inputRef={entrada}
          data-foco-inicial
          etiqueta="Nombre de la sala"
          requerido
          value={nombre}
          maxLength={MAXIMO_NOMBRE + 1}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrorNombre("");
            setErrorGeneral("");
          }}
          ayuda={`Hasta ${MAXIMO_NOMBRE} caracteres · ${nombre.length}/${MAXIMO_NOMBRE}`}
          error={errorNombre}
        />

        {errorGeneral && (
          <p role="alert" className="mt-3 rounded-lg bg-error-fondo p-3 font-medium text-error">
            {errorGeneral}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button type="button" className="btn-secundario" disabled={guardando} onClick={alCerrar}>
            Cancelar
          </button>
          <button type="submit" className="btn-principal disabled:opacity-60" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </ModalAccesible>
  );
}
