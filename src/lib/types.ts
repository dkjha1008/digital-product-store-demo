export type ActionResult =
  | { ok: true; error?: undefined }
  | { ok?: false; error: string };
