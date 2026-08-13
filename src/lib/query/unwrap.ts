import type { ActionResult } from "@/lib/types";

export function unwrapAction(result: ActionResult) {
  if (result.error) {
    throw new Error(result.error);
  }
  return result;
}
