import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  DEFAULT_S3_BUCKET,
  MAX_PRODUCT_FILE_BYTES,
  MAX_THUMBNAIL_BYTES,
  PRODUCT_FILE_TYPES,
  SIGNED_URL_TTL_SECONDS,
  THUMBNAIL_FILE_TYPES,
} from "@/lib/config/constants";
import { getEnv, isObjectStorageConfigured } from "@/lib/config/env";
import { sanitizeFileName } from "@/lib/crypto";
import { AppError } from "@/lib/errors";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

function getBucket() {
  return getEnv().S3_BUCKET || DEFAULT_S3_BUCKET;
}

function getS3Client() {
  const globalForS3 = globalThis as unknown as { s3?: S3Client };
  if (!globalForS3.s3) {
    const env = getEnv();
    globalForS3.s3 = new S3Client({
      region: env.AWS_REGION,
      endpoint: env.AWS_ENDPOINT_URL_S3 || undefined,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return globalForS3.s3;
}

let bucketReady: Promise<void> | null = null;

async function ensureBucket() {
  if (!bucketReady) {
    bucketReady = (async () => {
      const client = getS3Client();
      const Bucket = getBucket();
      try {
        await client.send(new HeadBucketCommand({ Bucket }));
      } catch {
        await client.send(new CreateBucketCommand({ Bucket }));
      }
    })();
  }
  return bucketReady;
}

export function isSafeStorageKey(key: string) {
  if (!key || key.includes("..") || key.startsWith("/") || key.includes("\\")) {
    return false;
  }
  return /^[a-zA-Z0-9._/-]+$/.test(key);
}

export function assertSafeStorageKey(key: string) {
  if (!isSafeStorageKey(key)) {
    throw new AppError("Invalid file key", 400);
  }
}

function assertUpload(file: File, type: "product" | "thumbnail") {
  const max = type === "thumbnail" ? MAX_THUMBNAIL_BYTES : MAX_PRODUCT_FILE_BYTES;
  if (file.size <= 0) {
    throw new AppError(`${type} file is required`);
  }
  if (file.size > max) {
    throw new AppError(
      type === "thumbnail"
        ? "Thumbnail must be 5MB or smaller"
        : "Product file must be 50MB or smaller",
    );
  }

  const allowed = type === "thumbnail" ? THUMBNAIL_FILE_TYPES : PRODUCT_FILE_TYPES;
  if (file.type && !allowed.has(file.type)) {
    throw new AppError(
      type === "thumbnail"
        ? "Thumbnail must be a JPEG, PNG, WebP, or GIF"
        : "Unsupported product file type",
    );
  }
}

export async function uploadFile(
  accountId: string,
  file: File,
  type: "product" | "thumbnail",
): Promise<{ key: string; size: number }> {
  assertUpload(file, type);

  const ext = path.extname(file.name).toLowerCase().slice(0, 8);
  const key = `${accountId}/${type}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (isObjectStorageConfigured()) {
    await ensureBucket();
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );
  } else {
    const filePath = resolveLocalPath(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);
  }

  return { key, size: buffer.length };
}

export async function getSignedDownloadUrl(
  key: string,
  fileName: string,
  expiresInSeconds = SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  assertSafeStorageKey(key);
  const safeName = sanitizeFileName(fileName);

  if (isObjectStorageConfigured()) {
    const client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
      ResponseContentDisposition: `attachment; filename="${safeName}"`,
    });
    return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  }

  return `/api/files/local?key=${encodeURIComponent(key)}&name=${encodeURIComponent(safeName)}`;
}

function resolveLocalPath(key: string) {
  assertSafeStorageKey(key);
  const root = path.resolve(LOCAL_UPLOAD_DIR);
  const filePath = path.resolve(root, key);
  if (!filePath.startsWith(root + path.sep)) {
    throw new AppError("Invalid file key", 400);
  }
  return filePath;
}

export async function readLocalFile(key: string): Promise<Buffer> {
  return readFile(resolveLocalPath(key));
}

export function getThumbnailUrl(key: string): string {
  return `/api/files/media?key=${encodeURIComponent(key)}`;
}
