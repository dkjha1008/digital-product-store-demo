import { jsonError } from "@/lib/http";
import { processDownload } from "@/lib/downloads/validate-token";
import { downloadTokenParamSchema } from "@/lib/validators/params";

type Params = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const parsed = downloadTokenParamSchema.safeParse({ token });

  if (!parsed.success) {
    return jsonError("Invalid token", 400);
  }

  const result = await processDownload(parsed.data.token);

  if ("error" in result) {
    return jsonError(result.error ?? "Download failed", 403);
  }

  return Response.redirect(result.url);
}
