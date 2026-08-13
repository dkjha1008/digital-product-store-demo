import { jsonError } from "@/lib/http";
import { processDownload } from "@/lib/downloads/validate-token";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;

  if (!token || token.length < 32) {
    return jsonError("Invalid token", 400);
  }

  const result = await processDownload(token);

  if ("error" in result) {
    return jsonError(result.error ?? "Download failed", 403);
  }

  return Response.redirect(result.url);
}
