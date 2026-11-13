import type { InputHTMLAttributes, ReactNode } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  etiqueta: string;
  // Puede incluir un enlace (por ejemplo «Ir a iniciar sesión» cuando el correo ya existe).
  error?: ReactNode;
  ayuda?: string;
  // Control dentro del campo, a la derecha (por ejemplo el botón «Mostrar» de la contraseña).
  accion?: ReactNode;
}

// Campo de formulario accesible: etiqueta ligada, ayuda y error asociados al campo (WCAG 3.3.1, 3.3.2).
export function Campo({ id, etiqueta, error, ayuda, accion, ...resto }: Props) {
  const ids = [ayuda ? `${id}-ayuda` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  const entrada = (
    <input
      id={id}
      className={`campo${accion ? " pr-24" : ""}`}
      aria-invalid={error ? true : undefined}
      aria-describedby={ids || undefined}
      style={error ? { borderColor: "var(--error)" } : undefined}
      {...resto}
    />
  );
  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-bold">
        {etiqueta}
      </label>
      {accion ? (
        <div className="relative">
          {entrada}
          <div className="absolute inset-y-0 right-1 flex items-center">{accion}</div>
        </div>
      ) : (
        entrada
      )}
      {ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-sm text-suave">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 font-bold text-error">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
