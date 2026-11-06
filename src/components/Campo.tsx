import type { InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
}

// Campo de formulario accesible: etiqueta ligada, ayuda y error asociados al campo (WCAG 3.3.1, 3.3.2).
export function Campo({ id, etiqueta, error, ayuda, ...resto }: Props) {
  const ids = [ayuda ? `${id}-ayuda` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">
        {etiqueta}
      </label>
      <input
        id={id}
        className="campo"
        aria-invalid={error ? true : undefined}
        aria-describedby={ids || undefined}
        style={error ? { borderColor: "var(--error)" } : undefined}
        {...resto}
      />
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-sm text-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-center gap-1 font-bold text-error">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}
