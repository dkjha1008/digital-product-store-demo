export function logError(context: string, err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${context}]`, message, err);
}

export function logInfo(context: string, details?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[${context}]`, details ?? "");
  }
}
