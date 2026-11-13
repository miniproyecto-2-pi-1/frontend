import { API_URL } from "./config";
import { auth } from "./firebase";

// Cliente único para hablar con la API.
// - Si hay sesión, adjunta "Authorization: Bearer <idToken>" (Firebase renueva el token solo).
// - Toda respuesta de error { error: { code, message } } se convierte en un ApiError tipado.

// Códigos que el frontend trata de forma especial. La API puede enviar otros: se conservan como string.
export type CodigoError =
  | "VALIDATION"
  | "USERNAME_TAKEN"
  | "EMAIL_TAKEN"
  | "PROFILE_INCOMPLETE"
  | "UNAUTHENTICATED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "INTERNAL_ERROR"
  | (string & {});

// Con VALIDATION, la API indica qué campo falló y por qué: { username: "Usa de 3 a 20 letras…" }.
export type CamposConError = Record<string, string>;

export class ApiError extends Error {
  readonly status: number; // 0 cuando no hubo respuesta (sin conexión o tiempo agotado)
  readonly code: CodigoError;
  readonly fields?: CamposConError;

  constructor(status: number, code: CodigoError, message: string, fields?: CamposConError) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export interface OpcionesApi {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

// Respuesta mínima que necesita apiFetch; la cumplen tanto fetch como el modo mock.
export interface RespuestaCruda {
  status: number;
  ok: boolean;
  json: () => Promise<unknown>;
}

// Con VITE_USE_MOCKS=true las rutas de usuarios se responden en el navegador (src/mocks/api.ts).
const USAR_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

// El plan gratuito de Render puede tardar hasta un minuto en despertar.
const ESPERA_MAXIMA_MS = 65_000;

const MENSAJE_SIN_CONEXION = "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.";
const MENSAJE_TIEMPO_AGOTADO = "El servidor tardó demasiado en responder. Inténtalo de nuevo.";
const MENSAJE_INESPERADO = "Ocurrió un error inesperado. Intenta de nuevo más tarde.";

async function encabezados(conCuerpo: boolean): Promise<Record<string, string>> {
  const resultado: Record<string, string> = { Accept: "application/json" };
  if (conCuerpo) resultado["Content-Type"] = "application/json";
  const token = await auth?.currentUser?.getIdToken();
  if (token) resultado.Authorization = `Bearer ${token}`;
  return resultado;
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

// Acepta { campo: "mensaje" } o [{ field, message }] para no depender de una sola forma.
function leerCampos(valor: unknown): CamposConError | undefined {
  if (Array.isArray(valor)) {
    const campos: CamposConError = {};
    for (const item of valor) {
      if (esObjeto(item) && typeof item.field === "string" && typeof item.message === "string") campos[item.field] = item.message;
    }
    return Object.keys(campos).length > 0 ? campos : undefined;
  }
  if (esObjeto(valor)) {
    const campos: CamposConError = {};
    for (const [campo, mensaje] of Object.entries(valor)) if (typeof mensaje === "string") campos[campo] = mensaje;
    return Object.keys(campos).length > 0 ? campos : undefined;
  }
  return undefined;
}

function aApiError(status: number, cuerpo: unknown): ApiError {
  const error = esObjeto(cuerpo) && esObjeto(cuerpo.error) ? cuerpo.error : null;
  const code = typeof error?.code === "string" ? error.code : status >= 500 ? "INTERNAL_ERROR" : `HTTP_${status}`;
  const message = typeof error?.message === "string" ? error.message : MENSAJE_INESPERADO;
  const fields = code === "VALIDATION" ? leerCampos(error?.fields) : undefined;
  return new ApiError(status, code, message, fields);
}

async function pedir(ruta: string, opciones: OpcionesApi, signal: AbortSignal): Promise<RespuestaCruda> {
  const conCuerpo = opciones.body !== undefined;
  const init: RequestInit = {
    method: opciones.method ?? "GET",
    headers: await encabezados(conCuerpo),
    body: conCuerpo ? JSON.stringify(opciones.body) : undefined,
    signal,
  };
  if (USAR_MOCKS) {
    const { responderMock } = await import("./mocks/api");
    const respuesta = await responderMock(ruta, init);
    if (respuesta) return respuesta;
  }
  return fetch(`${API_URL}${ruta}`, init);
}

// Hace la petición y devuelve el JSON de la respuesta. Lanza ApiError ante cualquier fallo.
export async function apiFetch<T>(ruta: string, opciones: OpcionesApi = {}): Promise<T> {
  const control = new AbortController();
  let agotado = false;
  const temporizador = setTimeout(() => {
    agotado = true;
    control.abort();
  }, ESPERA_MAXIMA_MS);
  const cancelarExterno = () => control.abort();
  if (opciones.signal?.aborted) control.abort();
  opciones.signal?.addEventListener("abort", cancelarExterno);

  try {
    let respuesta: RespuestaCruda;
    try {
      respuesta = await pedir(ruta, opciones, control.signal);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (agotado) throw new ApiError(0, "TIMEOUT", MENSAJE_TIEMPO_AGOTADO);
      if (opciones.signal?.aborted) throw error; // lo canceló quien llamó: se propaga el AbortError
      throw new ApiError(0, "NETWORK_ERROR", MENSAJE_SIN_CONEXION);
    }

    const cuerpo = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
    if (!respuesta.ok) throw aApiError(respuesta.status, cuerpo);
    return cuerpo as T;
  } finally {
    clearTimeout(temporizador);
    opciones.signal?.removeEventListener("abort", cancelarExterno);
  }
}
