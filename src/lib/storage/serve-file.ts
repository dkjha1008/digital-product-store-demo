import { NextResponse } from "next/server";

import { THUMBNAIL_URL_TTL_SECONDS } from "@/lib/config/constants";
import { isObjectStorageConfigured } from "@/lib/config/env";
import { sanitizeFileName } from "@/lib/crypto";
import { jsonError } from "@/lib/http";
import {
  getSignedDownloadUrl,
  readLocalFile,
} from "@/lib/storage";
import { fileQuerySchema } from "@/lib/validators/params";

type Options = {
  asAttachment?: boolean;
  redirectIfRemote?: boolean;
};

export async function serveStoredFile(request: Request, options: Options = {}) {
  const { asAttachment = false, redirectIfRemote = false } = options;
  const { searchParams } = new URL(request.url);
  const parsed = fileQuerySchema.safeParse({
    key: searchParams.get("key"),
    name: searchParams.get("name") ?? undefined,
  });

  if (!parsed.success) {
    return jsonError("Invalid key", 400);
  }

  const key = parsed.data.key;
  const name = sanitizeFileName(parsed.data.name);

  try {
    if (redirectIfRemote && isObjectStorageConfigured()) {
      const url = await getSignedDownloadUrl(key, name, THUMBNAIL_URL_TTL_SECONDS);
      return NextResponse.redirect(url);
    }

    const buffer = await readLocalFile(key);
    const headers: Record<string, string> = {
      "Content-Type": "application/octet-stream",
    };

    if (asAttachment) {
      headers["Content-Disposition"] = `attachment; filename="${name}"`;
    } else {
      headers["Cache-Control"] = "private, max-age=300";
    }

    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch {
    return jsonError("File not found", 404);
  }
}
