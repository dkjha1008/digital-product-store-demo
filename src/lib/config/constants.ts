export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const BCRYPT_ROUNDS = 12;

export const DOWNLOAD_MAX = 3;
export const DOWNLOAD_EXPIRY_HOURS = 24;
export const SIGNED_URL_TTL_SECONDS = 900;
export const THUMBNAIL_URL_TTL_SECONDS = 3600;

export const MAX_PRODUCT_FILE_BYTES = 50 * 1024 * 1024;
export const MAX_THUMBNAIL_BYTES = 5 * 1024 * 1024;

export const PRODUCT_FILE_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/epub+zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
]);

export const THUMBNAIL_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_STORE_NAME = "My Store";
export const DEFAULT_S3_BUCKET = "digital-products";
