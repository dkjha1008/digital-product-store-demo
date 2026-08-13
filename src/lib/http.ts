import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors";
import { logError } from "@/lib/logger";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleRouteError(context: string, err: unknown, fallback: string) {
  logError(context, err);

  if (err instanceof AppError && err.expose) {
    return jsonError(err.message, err.statusCode);
  }

  return jsonError(fallback, 500);
}
