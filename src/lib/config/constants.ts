export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const BCRYPT_ROUNDS = 12;

export const DOWNLOAD_MAX = 3;
export const DOWNLOAD_EXPIRY_HOURS = 24;
export const SIGNED_URL_TTL_SECONDS = 900;
export const THUMBNAIL_URL_TTL_SECONDS = 3600;

export const MAX_PRODUCT_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

export const IMAGE_FILE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const PRODUCT_FILE_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
]);

export const THUMBNAIL_FILE_TYPES = new Set(IMAGE_FILE_TYPES);

export const PRODUCT_FILE_EXTENSIONS = new Set([
  ".pdf",
  ".zip",
  ".epub",
  ".docx",
  ".txt",
]);

export const THUMBNAIL_FILE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

export function fileExtension(name: string) {
  const index = name.lastIndexOf(".");
  if (index < 0) return "";
  return name.slice(index).toLowerCase();
}

export function isAllowedUpload(
  file: { name: string; type: string },
  kind: "product" | "thumbnail",
) {
  const mime = file.type.toLowerCase();
  const ext = fileExtension(file.name);
  const mimes = kind === "thumbnail" ? THUMBNAIL_FILE_TYPES : PRODUCT_FILE_TYPES;
  const exts = kind === "thumbnail" ? THUMBNAIL_FILE_EXTENSIONS : PRODUCT_FILE_EXTENSIONS;

  if (kind === "product" && (IMAGE_FILE_TYPES.has(mime) || THUMBNAIL_FILE_EXTENSIONS.has(ext))) {
    return false;
  }

  if (mime && mime !== "application/octet-stream" && mimes.has(mime)) return true;
  if (exts.has(ext)) return true;
  return false;
}

export const PRODUCT_FILE_HINT = "PDF, ZIP, EPUB, DOCX, or TXT";
export const THUMBNAIL_FILE_HINT = "JPEG, PNG, WebP, or GIF";
export const PRODUCT_FILE_ACCEPT = ".pdf,.zip,.epub,.docx,.txt";
export const THUMBNAIL_FILE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg";

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_STORE_NAME = "My Store";
export const DEFAULT_S3_BUCKET = "digital-products";
