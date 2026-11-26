import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Avatar } from "../Avatar";
import { buscarCoincidencias } from "../../utils/busqueda";
import { Resaltado } from "./Resaltado";
import type { ClienteSala, EstadoConexion } from "../../tiempoReal";
import type { HistorialSala } from "../../hooks/useHistorialSala";
import { MAXIMO_MENSAJE, type Mensaje, type Persona } from "../../tipos";
import { etiquetaDia, horaCorta } from "../../utils/hora";

interface Props {
  cliente: ClienteSala;
  roomId: string;
  estado: EstadoConexion;
  mensajes: Mensaje[];
  // Estado de la carga del historial (US-11).
  historial: HistorialSala;
  personas: Persona[];
  // uid de la persona que está usando la pantalla: sus mensajes se distinguen.
  miUid: string;
}

// Un mismo color por persona: el del avatar que eligió, o uno estable sacado de su uid.
function colorDe(uid: string, personas: Persona[]): number {
  const persona = personas.find((p) => p.uid === uid);
  if (persona) return persona.avatar;
  let n = 0;
  for (const c of uid) n = (n * 31 + c.charCodeAt(0)) >>> 0;
  return n;
}

export function PanelChat({ cliente, roomId, estado, mensajes, historial, personas, miUid }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const escritura = useRef<HTMLTextAreaElement>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  // La lista solo baja sola si ya se estaba leyendo lo último; si no, se avisa con «mensajes nuevos».
  const alFinal = useRef(true);
  const ultimoId = useRef<string | null>(null);
  // Altura de la lista justo antes de cargar mensajes anteriores: sirve para que lo que se leía no se mueva.
  const anclaAltura = useRef<number | null>(null);
  const [nuevos, setNuevos] = useState(0);

  // Buscador del chat: el ícono de la lupa abre el campo debajo; se marcan los mensajes que coinciden y se recorren.
  const [consulta, setConsulta] = useState("");
  const [actual, setActual] = useState(0);
  const campoBusqueda = useRef<HTMLInputElement>(null);
  const coincidencias = useMemo(
    () => (consulta.trim() ? mensajes.filter((m) => buscarCoincidencias(m.texto, consulta).length > 0).map((m) => m.id) : []),
    [mensajes, consulta],
  );
  const idActual = coincidencias.length > 0 ? coincidencias[Math.min(actual, coincidencias.length - 1)] : null;

  // Centra un mensaje moviendo solo la lista del chat (scrollIntoView movería también el panel que la contiene).
  function centrar(elemento: Element | null | undefined) {
    const cont = contenedor.current;
    if (!cont || !elemento) return;
    const c = cont.getBoundingClientRect();
    const r = elemento.getBoundingClientRect();
    cont.scrollTo({ top: cont.scrollTop + (r.top - c.top) - (c.height - r.height) / 2, behavior: "smooth" });
  }

  function irACoincidencia(indice: number) {
    const id = coincidencias[indice];
    setActual(indice);
    centrar(contenedor.current?.querySelector(`[data-mensaje="${CSS.escape(id)}"]`));
  }

  function alBuscar(valor: string) {
    setConsulta(valor);
    const ids = valor.trim() ? mensajes.filter((m) => buscarCoincidencias(m.texto, valor).length > 0).map((m) => m.id) : [];
    // Empieza por la coincidencia más reciente (la de más abajo).
    const indice = Math.max(ids.length - 1, 0);
    setActual(indice);
    if (ids.length > 0) {
      centrar(contenedor.current?.querySelector(`[data-mensaje="${CSS.escape(ids[indice])}"]`));
    }
  }

  function limpiarBusqueda() {
    setConsulta("");
    setActual(0);
    campoBusqueda.current?.focus();
  }

  function alPulsarBusqueda(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Escape") {
      evento.preventDefault();
      limpiarBusqueda();
    } else if (evento.key === "Enter" && coincidencias.length > 0) {
      evento.preventDefault();
      const n = coincidencias.length;
      irACoincidencia(evento.shiftKey ? (actual - 1 + n) % n : (actual + 1) % n);
    }
  }

  const sinConexion = estado !== "conectado";
  // Un mensaje vacío o de solo espacios no se envía.
  const vacio = texto.trim().length === 0;

  async function enviar(evento?: FormEvent) {
    evento?.preventDefault();
    if (vacio || enviando || sinConexion) return;

    const aEnviar = texto.trim();
    setEnviando(true);
    setErrorEnvio("");
    setTexto(""); // el campo queda libre enseguida; si algo falla, el texto vuelve
    try {
      await cliente.enviar(roomId, aEnviar);
    } catch (error) {
      // Se devuelve el texto para poder reintentar, salvo que ya haya escrito otra cosa.
      setTexto((actual) => (actual ? actual : aEnviar));
      setErrorEnvio(error instanceof Error ? error.message : "No pudimos enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
      escritura.current?.focus();
    }
  }

  // Enter envía; Mayús + Enter hace un salto de línea.
  function alPulsar(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === "Enter" && !evento.shiftKey && !evento.nativeEvent.isComposing) {
      evento.preventDefault();
      void enviar();
    }
  }

  async function cargarAnteriores() {
    const cont = contenedor.current;
    if (cont) anclaAltura.current = cont.scrollHeight;
    await historial.cargarAnteriores();
  }

  function irAlFinal() {
    const cont = contenedor.current;
    if (cont) cont.scrollTop = cont.scrollHeight;
    alFinal.current = true;
    setNuevos(0);
  }

  function alDesplazar() {
    const cont = contenedor.current;
    if (!cont) return;
    const cerca = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 48;
    alFinal.current = cerca;
    if (cerca) setNuevos(0);
  }

  // Si la lista cambia de tamaño (se cambia de pestaña o de ventana) y se estaba al día, se queda abajo.
  useEffect(() => {
    const cont = contenedor.current;
    if (!cont || typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(() => {
      if (alFinal.current) cont.scrollTop = cont.scrollHeight;
    });
    observador.observe(cont);
    return () => observador.disconnect();
  }, []);

  useLayoutEffect(() => {
    const cont = contenedor.current;
    const ultimo = mensajes[mensajes.length - 1];
    const idPrevio = ultimoId.current;
    ultimoId.current = ultimo?.id ?? null;
    if (!cont || !ultimo) return;
    if (ultimo.id === idPrevio) {
      // No llegó nada al final: se agregaron mensajes más viejos (historial).
      if (anclaAltura.current !== null) {
        cont.scrollTop += cont.scrollHeight - anclaAltura.current; // lo que se leía queda en su lugar
        anclaAltura.current = null;
      } else if (alFinal.current) {
        cont.scrollTop = cont.scrollHeight;
      }
      return;
    }
    anclaAltura.current = null;

    const indicePrevio = idPrevio ? mensajes.findIndex((m) => m.id === idPrevio) : -1;
    const llegaron = indicePrevio >= 0 ? mensajes.length - 1 - indicePrevio : 0;

    if (idPrevio === null || alFinal.current || ultimo.uid === miUid) {
      cont.scrollTop = cont.scrollHeight; // primera carga, lectura al día o mensaje propio: se baja
      setNuevos(0);
    } else {
      setNuevos((n) => n + llegaron); // se está leyendo algo anterior: no se mueve la lista
    }
  }, [mensajes, miUid]);

  const iconoLupa = (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Buscador del chat: siempre visible. Con texto aparecen el contador y las flechas para recorrer las coincidencias. */}
      <div id="busqueda-chat" className="flex shrink-0 items-center px-3.5 pb-2 pt-1">
        <div className="flex min-w-0 flex-1 items-center gap-1 rounded-xl bg-sala-campo pl-3 pr-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-enlace">
          <span aria-hidden="true" className="shrink-0 text-suave">
            {iconoLupa}
          </span>
          <input
            ref={campoBusqueda}
            type="search"
            autoComplete="off"
            aria-label="Buscar en el chat"
            placeholder="Buscar en el chat"
            value={consulta}
            onChange={(e) => alBuscar(e.target.value)}
            onKeyDown={alPulsarBusqueda}
            className="campo-envuelto min-h-10 min-w-0 flex-1 bg-transparent px-1 text-sm text-texto placeholder:text-suave"
          />
          {consulta.trim() && (
            <>
              <span role="status" className="shrink-0 text-xs text-texto/75">
                {coincidencias.length === 0 ? "Sin coincidencias" : `${Math.min(actual, coincidencias.length - 1) + 1} de ${coincidencias.length}`}
              </span>
              <button
                type="button"
                aria-label="Coincidencia anterior"
                disabled={coincidencias.length === 0}
                onClick={() => irACoincidencia((actual - 1 + coincidencias.length) % coincidencias.length)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-enlace hover:bg-principal-suave disabled:opacity-40"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 15 6-6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Coincidencia siguiente"
                disabled={coincidencias.length === 0}
                onClick={() => irACoincidencia((actual + 1) % coincidencias.length)}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-enlace hover:bg-principal-suave disabled:opacity-40"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Borrar búsqueda"
                onClick={limpiarBusqueda}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-suave hover:bg-principal-suave"
              >
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div ref={contenedor} onScroll={alDesplazar} className="barra-fina h-full overflow-y-auto overflow-x-hidden p-4">
          {historial.estado === "cargando" && mensajes.length === 0 && (
            <div role="status" className="space-y-4" aria-label="Cargando mensajes">
              <p className="text-center text-sm font-semibold text-suave">Cargando mensajes…</p>
              {[0, 1, 2, 3].map((n) => (
                <div key={n} aria-hidden="true" className="flex animate-pulse gap-2">
                  <div className="size-8 shrink-0 rounded-full bg-borde" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/4 rounded bg-borde" />
                    <div className="h-3 w-3/4 rounded bg-borde" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {historial.estado === "error" && (
            <div role="alert" className="mb-4 rounded-lg bg-error-fondo p-3 text-sm font-medium text-error">
              <p>{historial.error}</p>
              <button type="button" className="btn-secundario mt-2 min-h-11" onClick={historial.reintentar}>
                Reintentar
              </button>
            </div>
          )}

          {historial.estado === "listo" && mensajes.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-4 py-10 text-center">
              <p className="font-bold">Aún no hay mensajes</p>
              <p className="text-sm text-suave">Escribe el primero para saludar a tu grupo.</p>
            </div>
          )}

          {historial.hayMas && mensajes.length > 0 && (
            <div className="mb-4 text-center">
              <button
                type="button"
                className="btn-secundario min-h-11 text-sm"
                disabled={historial.cargandoAnteriores}
                onClick={() => void cargarAnteriores()}
              >
                {historial.cargandoAnteriores ? "Cargando mensajes…" : "↑ Cargar mensajes anteriores"}
              </button>
              {historial.errorAnteriores && (
                <p role="alert" className="mt-2 text-sm font-medium text-error">
                  {historial.errorAnteriores}
                </p>
              )}
            </div>
          )}

          <ul role="log" aria-label="Mensajes de la sala" aria-live="polite" aria-relevant="additions">
            {mensajes.map((m, i) => {
              const propio = m.uid === miUid;
              const dia = etiquetaDia(m.creadoEn);
              const previo = i > 0 ? mensajes[i - 1] : null;
              const siguiente = i < mensajes.length - 1 ? mensajes[i + 1] : null;
              const diaNuevo = !previo || dia !== etiquetaDia(previo.creadoEn);
              // Los mensajes seguidos de la misma persona se agrupan: nombre y avatar solo en el primero, hora solo en el último.
              const inicio = diaNuevo || previo.uid !== m.uid;
              const fin = !siguiente || siguiente.uid !== m.uid || etiquetaDia(siguiente.creadoEn) !== dia;
              const marca = m.id === idActual ? "outline outline-2 outline-offset-2 outline-[#d97706]" : "";
              return (
                <Fragment key={m.id}>
                  {diaNuevo && (
                    <li className="mt-4 flex justify-center first:mt-0">
                      <span className="rounded-lg bg-sala-campo px-3 py-0.5 text-xs font-semibold text-suave">{dia}</span>
                    </li>
                  )}
                  {propio ? (
                    <li data-mensaje={m.id} className={`flex min-w-0 flex-col items-end ${inicio ? "mt-4" : "mt-0.5"}`}>
                      <p
                        className={`inline-block max-w-[88%] whitespace-pre-wrap rounded-[14px] bg-[#e0d4ff] px-3.5 py-2 text-left text-sm leading-snug text-[#241552] dark:bg-[#4b3b80] dark:text-white [overflow-wrap:anywhere] ${
                          inicio ? "" : "rounded-tr-md"
                        } ${fin ? "" : "rounded-br-md"} ${marca}`}
                      >
                        <span className="sr-only">Tú: </span>
                        <Resaltado texto={m.texto} consulta={consulta} />
                      </p>
                      <time dateTime={m.creadoEn} className={fin ? "mt-1 text-[11px] text-suave" : "sr-only"}>
                        {horaCorta(m.creadoEn)}
                      </time>
                    </li>
                  ) : (
                    <li data-mensaje={m.id} className={`flex min-w-0 gap-2.5 ${inicio ? "mt-4" : "mt-0.5"}`}>
                      {inicio ? <Avatar nombre={m.username} color={colorDe(m.uid, personas)} tam={30} /> : <span aria-hidden="true" className="w-[30px] shrink-0" />}
                      <div className="min-w-0 max-w-[88%]">
                        {inicio ? (
                          <p className="text-xs">
                            <strong>{m.username}</strong>{" "}
                            <time dateTime={m.creadoEn} className="ml-1 text-suave">
                              {horaCorta(m.creadoEn)}
                            </time>
                          </p>
                        ) : (
                          <time dateTime={m.creadoEn} className="sr-only">
                            {horaCorta(m.creadoEn)}
                          </time>
                        )}
                        <p className={`whitespace-pre-wrap text-left text-sm leading-snug [overflow-wrap:anywhere] ${marca}`}>
                          <Resaltado texto={m.texto} consulta={consulta} />
                        </p>
                      </div>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ul>
        </div>

        {nuevos > 0 && (
          <button
            type="button"
            onClick={irAlFinal}
            className="absolute bottom-3 left-1/2 z-10 min-h-11 -translate-x-1/2 rounded-xl bg-principal px-4 py-2 text-sm font-bold text-white shadow-lg"
          >
            <span aria-hidden="true">↓ </span>
            {nuevos} {nuevos === 1 ? "mensaje nuevo" : "mensajes nuevos"}
          </button>
        )}
      </div>

      <form noValidate onSubmit={(e) => void enviar(e)} className="shrink-0 px-3.5 pb-3.5 pt-2">
        <div className="flex items-end gap-1 rounded-[14px] bg-sala-campo py-1 pl-4 pr-1 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-enlace">
          <textarea
            ref={escritura}
            rows={1}
            maxLength={MAXIMO_MENSAJE}
            aria-label="Escribe un mensaje"
            placeholder="Escribe un mensaje"
            className="campo-envuelto max-h-32 min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-texto placeholder:text-suave [field-sizing:content]"
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setErrorEnvio("");
            }}
            onKeyDown={alPulsar}
          />

          <button
            type="submit"
            aria-label="Enviar mensaje"
            disabled={vacio || enviando || sinConexion}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-principal text-white transition-colors hover:bg-[#5a30c9] disabled:cursor-not-allowed disabled:bg-borde disabled:text-suave"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2l-7 20-4-9-9-4Z" />
            </svg>
          </button>
        </div>

        <p className="mt-1.5 text-center text-xs text-texto/75">
          {sinConexion ? "Sin conexión con la sala: no se pueden enviar mensajes." : "Enter envía · Mayús + Enter hace un salto de línea"}
          {texto.length >= MAXIMO_MENSAJE * 0.9 && ` · ${texto.length}/${MAXIMO_MENSAJE}`}
        </p>

        {errorEnvio && (
          <p role="alert" className="mt-2 rounded-lg bg-error-fondo p-2 text-sm font-medium text-error">
            {errorEnvio}
          </p>
        )}
      </form>
    </div>
  );
}
