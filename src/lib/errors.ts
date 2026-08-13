export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
    public readonly expose = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (err instanceof AppError && err.expose) return err.message;
  if (err instanceof Error) return err.message;
  return fallback;
}

export function firstZodError(err: { errors: { message?: string }[] }) {
  return err.errors[0]?.message || "Invalid input";
}

export function isUniqueViolation(err: unknown) {
  let current: unknown = err;
  for (let i = 0; i < 5 && current; i += 1) {
    if (
      typeof current === "object" &&
      current !== null &&
      "code" in current &&
      (current as { code: unknown }).code === "23505"
    ) {
      return true;
    }
    current =
      typeof current === "object" && current !== null && "cause" in current
        ? (current as { cause: unknown }).cause
        : undefined;
  }
  return false;
}
