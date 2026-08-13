export function FormError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return <p className={className ? `error-text ${className}` : "error-text"}>{message}</p>;
}

export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-[var(--success)]">{message}</p>;
}
