import { Avatar } from "./Avatar";

const NOMBRES_AVATAR = ["Morado", "Verde", "Magenta", "Turquesa", "Rojo", "Ámbar"];

// «Elige tu avatar»: grupo de opciones (radio) con el nombre de cada color para el lector de pantalla.
// En 320 px caben los 6 en una fila; en pantallas anchas se reparten a lo ancho.
export function SelectorAvatar({ valor, onCambio, nombre }: { valor: number; onCambio: (indice: number) => void; nombre: string }) {
  return (
    <fieldset>
      <legend className="mb-2 font-bold">Elige tu avatar</legend>
      <div className="grid grid-cols-6 justify-items-center gap-1 sm:flex sm:justify-between">
        {NOMBRES_AVATAR.map((color, i) => (
          <label key={color} className="cursor-pointer">
            <input
              type="radio"
              name="avatar"
              value={i}
              checked={valor === i}
              onChange={() => onCambio(i)}
              className="peer sr-only"
            />
            <span className="block rounded-full p-0.5 peer-checked:ring-[3px] peer-checked:ring-enlace peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-enlace">
              <Avatar nombre={nombre.trim() || "Tú"} color={i} tam={38} />
            </span>
            <span className="sr-only">{color}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
