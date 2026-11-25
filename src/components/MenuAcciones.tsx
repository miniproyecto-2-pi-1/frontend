import { useLocation } from "react-router-dom";
import { useDesplegable } from "../hooks/useDesplegable";

export interface AccionMenu {
  texto: string;
  icono: "editar" | "eliminar";
  // Acción delicada (por ejemplo eliminar): se separa del resto y va en el color de error.
  peligro?: boolean;
  // Recibe el botón de tres puntos para que, al cerrar la ventana que abra la acción, el foco vuelva a él.
  alElegir: (boton: HTMLButtonElement | null) => void;
}

interface Props {
  // Nombre accesible del botón; el ⋯ solo no dice nada a un lector de pantalla.
  etiqueta: string;
  acciones: AccionMenu[];
  // Sobre el color de una tarjeta (icono blanco) o sobre el fondo normal (icono de enlace).
  sobreColor?: boolean;
  // Círculo con borde alrededor de los tres puntos (en el encabezado de la sala); sin él, solo los puntos (en las tarjetas).
  contorno?: boolean;
  className?: string;
}

const ICONOS = {
  editar: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  eliminar: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
};

// Botón de tres puntos (⋯) con las acciones de una sala. Usa el mismo menú desplegable que el de la cuenta
// (useDesplegable): se abre con Enter o Espacio, se recorre con Tab, y Esc lo cierra devolviendo el foco al botón.
export function MenuAcciones({ etiqueta, acciones, sobreColor = false, contorno = false, className = "" }: Props) {
  const { pathname } = useLocation();
  const menu = useDesplegable(pathname);

  return (
    // Si quien lo usa lo posiciona con «absolute», ya es punto de referencia del panel; si no, se le da «relative».
    <div ref={menu.contenedor} className={className.includes("absolute") ? className : `relative ${className}`}>
      <button
        {...menu.propsBoton}
        aria-label={etiqueta}
        aria-haspopup="true"
        className={`inline-flex size-11 items-center justify-center rounded-full ${
          sobreColor ? "text-white hover:bg-white/20" : `text-enlace hover:bg-superficie ${contorno ? "border-[1.5px] border-enlace" : ""}`
        } ${menu.abierto ? (sobreColor ? "bg-white/25" : "bg-superficie") : ""}`}
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>

      <div
        {...menu.propsPanel}
        className="absolute right-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-[10px] border-[1.5px] border-borde bg-fondo p-2 text-left text-texto shadow-lg"
      >
        <ul className="flex flex-col gap-1">
          {acciones.map((accion, i) => (
            <li key={accion.texto}>
              {accion.peligro && i > 0 && <hr className="my-1 border-borde" />}
              <button
                type="button"
                className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left font-semibold hover:bg-superficie ${
                  accion.peligro ? "text-error" : "text-texto"
                }`}
                onClick={() => {
                  menu.cerrar(false);
                  accion.alElegir(menu.propsBoton.ref.current);
                }}
              >
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {ICONOS[accion.icono]}
                </svg>
                {accion.texto}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
