import { z } from "zod";

import { firstZodError } from "@/lib/errors";

export type FieldErrors = Record<string, string>;

export function parseInput<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }
  return { success: true, data: parsed.data };
}

export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}
