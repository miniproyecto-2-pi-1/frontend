import {useCallback,useEffect,useRef,useState,type FormEvent} from "react";
import {Link,useNavigate} from "react-router-dom";
import {ApiError,apiFetch} from "../api";
import { colorAvatar, iniciales } from "../components/Avatar";
import { Campo } from "../components/Campo";
import { MenuAcciones } from "../components/MenuAcciones";
import { ModalAccesible } from "../components/ModalAccesible";
import { ModalEditarSala } from "../components/sala/ModalEditarSala";
import { useTitulo } from "../hooks/useTitulo";
import { tieneEspaciosSobrantes, validarCodigoSala } from "../validacionSala";

export type SalaPropia = {
  id: string;
  nombre: string;
  creadaEn?: string;
  esAdministrador?: boolean;
};

const MAX_NOMBRE = 50;

const errorConexion =
  "No pudimos cargar tus salas. Revisa tu conexión e inténtalo de nuevo.";

// Hash simple del ID: la misma sala conserva su color en cada visita.
function colorSala(id: string) {
  let n = 0;
  for (const c of id) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return colorAvatar(n);
}

function esAbort(error: unknown) {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

export function MisSalas() {
  useTitulo("Mis salas");

  const navegar = useNavigate();

  const [salas, setSalas] =
    useState<SalaPropia[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [errorCarga, setErrorCarga] =
    useState("");

  const [reintento, setReintento] =
    useState(0);

  const [modal, setModal] =
    useState(false);

  const [nombre, setNombre] =
    useState("");

  const [errorNombre, setErrorNombre] =
    useState("");

  const [errorCrear, setErrorCrear] =
    useState("");

  const [creando, setCreando] =
    useState(false);

  const [aviso, setAviso] =
    useState("");

  const [codigo, setCodigo] =
    useState("");

  const [errorCodigo, setErrorCodigo] =
    useState("");

  const [uniendo, setUniendo] =
    useState(false);

  const codigoRef =
    useRef<HTMLInputElement>(null);

  // Acción del menú ⋯ de una tarjeta (US-07): editar o eliminar, con la sala elegida.
  const [accion, setAccion] =
    useState<{ tipo: "editar" | "eliminar"; sala: SalaPropia } | null>(null);

  // Botón de tres puntos que abrió la ventana: al cerrarla, el foco vuelve a él.
  const iniciadorRef =
    useRef<HTMLButtonElement | null>(null);

  function abrirAccion(
    tipo: "editar" | "eliminar",
    sala: SalaPropia,
    boton: HTMLButtonElement | null
  ) {
    iniciadorRef.current = boton;
    setAccion({ tipo, sala });
  }

  const abrirRef =
    useRef<HTMLButtonElement>(null);

  const entradaRef =
    useRef<HTMLInputElement>(null);

  const cerrarModal = useCallback(() => {
    if (!creando) {
      setModal(false);
      setNombre("");
      setErrorNombre("");
      setErrorCrear("");
    }
  }, [creando]);

  useEffect(() => {
    const control = new AbortController();

    setCargando(true);
    setErrorCarga("");

    apiFetch<
      SalaPropia[] | { salas: SalaPropia[] }
    >(
      "/api/v1/rooms",
      {
        signal: control.signal,
      }
    )
      .then((respuesta) => {
        const listado = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.salas;

        if (!Array.isArray(listado)) {
          throw new Error(
            "Respuesta inválida de la API de salas."
          );
        }

        setSalas(listado);
      })
      .catch((e: unknown) => {
        if (
          !control.signal.aborted &&
          !esAbort(e)
        ) {
          setErrorCarga(errorConexion);
        }
      })
      .finally(() => {
        if (!control.signal.aborted) {
          setCargando(false);
        }
      });

    return () => control.abort();
  }, [reintento]);

  async function crear(evento: FormEvent) {
    evento.preventDefault();

    if (creando) return;

    const limpio = nombre.trim();

    if (
      limpio.length < 1 ||
      limpio.length > MAX_NOMBRE
    ) {
      setErrorNombre(
        "Escribe un nombre de 1 a 50 caracteres."
      );

      entradaRef.current?.focus();
      return;
    }

    setCreando(true);
    setErrorNombre("");
    setErrorCrear("");

    try {
      const sala = await apiFetch<SalaPropia>(
        "/api/v1/rooms",
        {
          method: "POST",
          body: {
            nombre: limpio,
          },
        }
      );

      if (
        typeof sala.id !== "string" ||
        !sala.id
      ) {
        throw new Error(
          "No se recibió el ID de la sala."
        );
      }

      setSalas((actuales) => [
        sala,
        ...actuales,
      ]);

      setModal(false);

      navegar(
        `/salas/${encodeURIComponent(sala.id)}`,
        {
          state: {
            salaCreada: true,
            sala,
          },
        }
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.code === "VALIDATION" &&
        error.fields?.nombre
      ) {
        setErrorNombre(
          error.fields.nombre
        );
      } else if (
        error instanceof ApiError &&
        error.code === "PROFILE_INCOMPLETE"
      ) {
        setErrorCrear(
          "Debes elegir tu nombre de usuario para crear salas."
        );
      } else {
        setErrorCrear(
          "No pudimos crear la sala. Inténtalo de nuevo."
        );
      }
    } finally {
      setCreando(false);
    }
  }

  // US-08: unirse a una sala con su código. El texto se limpia (espacios, mayúsculas) antes de pedirla a la API.
  async function unirse(evento: FormEvent) {
    evento.preventDefault();

    if (uniendo) return;

    const resultado = validarCodigoSala(codigo);

    if (!resultado.ok) {
      setErrorCodigo(resultado.error);
      codigoRef.current?.focus();
      return;
    }

    setUniendo(true);
    setErrorCodigo("");

    try {
      const sala = await apiFetch<SalaPropia>(
        `/api/v1/rooms/${encodeURIComponent(resultado.id)}`
      );

      navegar(
        `/salas/${encodeURIComponent(sala.id)}`,
        {
          state: {
            sala,
          },
        }
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "ROOM_NOT_FOUND" ||
          error.status === 404)
      ) {
        setErrorCodigo(
          "Sala no encontrada. Revisa el código."
        );
      } else {
        setErrorCodigo(
          "No pudimos unirte a la sala. Revisa tu conexión e inténtalo de nuevo."
        );
      }

      codigoRef.current?.focus();
    } finally {
      setUniendo(false);
    }
  }

  async function copiar(id: string) {
    try {
      await navigator.clipboard.writeText(id);

      setAviso(
        `ID copiado: ${id}`
      );
    } catch {
      setAviso(
        "No pudimos copiar el ID. Inténtalo de nuevo."
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Mis salas
          </h1>

          <p className="text-suave">
            Las salas de estudio que creaste.
          </p>
        </div>

        <button
          ref={abrirRef}
          className="btn-principal w-full sm:w-auto"
          type="button"
          onClick={() => {
            setModal(true);
            setErrorNombre("");
            setErrorCrear("");
          }}
        >
          <span aria-hidden="true">
            +
          </span>{" "}
          Nueva sala
        </button>
      </div>

      <form
        noValidate
        aria-labelledby="titulo-unirse"
        className="tarjeta mb-6"
        onSubmit={(e) =>
          void unirse(e)
        }
      >
        <h2
          id="titulo-unirse"
          className="mb-3 text-lg font-bold"
        >
          Unirme a una sala
        </h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <Campo
              id="codigo-sala"
              inputRef={codigoRef}
              etiqueta="Código de la sala"
              requerido
              value={codigo}
              placeholder="Ej. K7P2-91XQ"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              disabled={uniendo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setErrorCodigo("");
              }}
              ayuda={
                tieneEspaciosSobrantes(codigo)
                  ? "Quitamos los espacios al inicio y al final del código."
                  : "Te lo comparte quien creó la sala."
              }
              error={errorCodigo}
            />
          </div>

          <button
            type="submit"
            className="btn-principal w-full disabled:opacity-60 sm:mt-8 sm:w-auto"
            disabled={uniendo}
          >
            {uniendo
              ? "Uniéndome…"
              : "Unirme"}
          </button>
        </div>
      </form>

      {aviso && (
        <p
          role="status"
          aria-live="polite"
          className="mb-4 rounded-lg bg-exito-fondo p-3 text-exito"
        >
          ✓ {aviso}
        </p>
      )}

      {cargando ? (
        <div
          role="status"
          aria-live="polite"
        >
          <p className="mb-4 font-semibold text-suave">
            ◌ Conectando… Cargando tus salas…
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((n) => (
              <div
                key={n}
                className="tarjeta animate-pulse space-y-3"
              >
                <div className="h-4 w-2/3 rounded bg-borde" />
                <div className="h-4 w-1/3 rounded bg-borde" />
                <div className="h-4 w-1/2 rounded bg-borde" />
                <div className="h-10 w-24 rounded bg-borde" />
              </div>
            ))}
          </div>
        </div>
      ) : errorCarga ? (
        <div role="alert">
          <p className="mb-4 rounded-lg bg-red-100 p-4 font-medium text-red-800 dark:bg-red-950 dark:text-red-200">
            {errorCarga}
          </p>

          <button
            type="button"
            className="btn-secundario"
            onClick={() =>
              setReintento((v) => v + 1)
            }
          >
            Reintentar
          </button>
        </div>
      ) : salas.length === 0 ? (
        <section
          aria-labelledby="sin-salas"
          className="rounded-lg border-2 border-dashed border-borde px-5 py-12 text-center"
        >
          <h2
            id="sin-salas"
            className="mb-2 text-xl font-bold"
          >
            Aún no tienes salas
          </h2>

          <p className="mx-auto max-w-lg text-suave">
            Crea una sala para estudiar con tu grupo.
            Aparecerá aquí con su ID para que lo compartas.
          </p>
        </section>
      ) : (
        <ul
          aria-label="Salas que creaste"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {salas.map((sala) => {
            const color = colorSala(sala.id);
            return (
              <li
                key={sala.id}
                className="tarjeta min-w-0"
              >
                <div
                  aria-hidden="true"
                  className="-mx-5 -mt-5 mb-4 h-2 rounded-t-[9px]"
                  style={{ background: color }}
                />
  
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] font-bold text-white"
                      style={{ background: color }}
                    >
                      {iniciales(sala.nombre)}
                    </span>

                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold">
                        {sala.nombre}
                      </h2>

                      {sala.esAdministrador !== false && (
                        <p className="text-sm font-semibold text-enlace">
                          Anfitrión
                        </p>
                      )}
                    </div>
                  </div>

                  {sala.esAdministrador !== false && (
                    <MenuAcciones
                      className="-mr-2 -mt-1 shrink-0"
                      etiqueta={`Más acciones de la sala ${sala.nombre}`}
                      acciones={[
                        {
                          texto: "Editar sala",
                          icono: "editar",
                          alElegir: (boton) =>
                            abrirAccion("editar", sala, boton),
                        },
                      ]}
                    />
                  )}
                </div>

                <p className="mt-4 text-sm text-suave">
                  ID de la sala
                </p>
  
                <p className="mt-1 break-all font-mono font-semibold">
                  {sala.id}
                </p>
  
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    className="btn-secundario"
                    to={`/salas/${encodeURIComponent(sala.id)}`}
                  >
                    Entrar
                  </Link>
  
                  <button
                    type="button"
                    className="min-h-11 px-2 font-semibold text-enlace underline"
                    aria-label={`Copiar ID de ${sala.nombre}`}
                    onClick={() =>
                      void copiar(sala.id)
                    }
                  >
                    ▢ Copiar ID
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modal && (
        <ModalAccesible
          titulo="Nueva sala"
          descripcion="Ponle un nombre para que tu grupo la reconozca."
          alCerrar={cerrarModal}
          ocupado={creando}
          iniciadorRef={abrirRef}
        >
          <form
            noValidate
            onSubmit={(e) =>
              void crear(e)
            }
          >
            <Campo
              id="nombre-sala"
              inputRef={entradaRef}
              data-foco-inicial
              etiqueta="Nombre de la sala"
              requerido
              value={nombre}
              maxLength={51}
              onChange={(e) => {
                setNombre(e.target.value);
                setErrorNombre("");
                setErrorCrear("");
              }}
              ayuda={`Hasta 50 caracteres · ${nombre.length}/50`}
              error={errorNombre}
            />

            {errorCrear && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-red-100 p-3 text-red-800 dark:bg-red-950 dark:text-red-200"
              >
                {errorCrear}
              </p>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-secundario"
                disabled={creando}
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn-principal disabled:opacity-60"
                disabled={creando}
              >
                {creando
                  ? "Creando sala…"
                  : "Crear sala"}
              </button>
            </div>
          </form>
        </ModalAccesible>
      )}

      {accion?.tipo === "editar" && (
        <ModalEditarSala
          sala={accion.sala}
          iniciadorRef={iniciadorRef}
          alCerrar={() => setAccion(null)}
          alGuardada={(actualizada) => {
            setSalas((actuales) =>
              actuales.map((s) =>
                s.id === actualizada.id
                  ? { ...s, nombre: actualizada.nombre }
                  : s
              )
            );
            setAviso(`Sala actualizada: «${actualizada.nombre}»`);
            setAccion(null);
          }}
        />
      )}
    </div>
  );
}
