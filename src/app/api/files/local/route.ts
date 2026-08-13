import { serveStoredFile } from "@/lib/storage/serve-file";

export function GET(request: Request) {
  return serveStoredFile(request, { asAttachment: true });
}
