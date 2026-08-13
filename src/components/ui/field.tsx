import type { ReactNode } from "react";

type Props = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, error, children }: Props) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className={error ? "field-invalid" : undefined}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={errorId} className="error-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)] mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
