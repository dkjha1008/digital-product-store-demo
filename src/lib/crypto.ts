import { createHash, createHmac } from "crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hmacSha256(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function sanitizeFileName(name: string) {
  return name.replace(/[\r\n"]/g, "").slice(0, 180) || "download";
}
