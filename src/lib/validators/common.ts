import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid id");

export const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .max(254)
  .transform((value) => value.toLowerCase());

export const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(48)
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens",
  );

export const currencySchema = z
  .string()
  .trim()
  .length(3, "Currency must be a 3-letter code")
  .regex(/^[A-Za-z]{3}$/, "Currency must be a 3-letter code")
  .transform((value) => value.toUpperCase());

export const priceMinorSchema = z.preprocess(
  (value) => (typeof value === "number" ? String(value) : (value ?? "")),
  z
    .string()
    .trim()
    .min(1, "Price is required")
    .regex(/^\d+$/, "Price must be a whole number of cents")
    .transform((value) => Number(value))
    .refine((value) => value <= 99_999_999, "Price is too large"),
);

export const storageKeySchema = z
  .string()
  .min(1, "Invalid key")
  .max(512, "Invalid key")
  .refine(
    (key) =>
      !key.includes("..") &&
      !key.startsWith("/") &&
      !key.includes("\\") &&
      /^[a-zA-Z0-9._/-]+$/.test(key),
    "Invalid key",
  );

export const downloadFileNameSchema = z
  .string()
  .max(180)
  .default("file");

export const downloadTokenSchema = z
  .string()
  .regex(/^[a-f0-9]{64}$/i, "Invalid token");

export const stripeCheckoutSessionIdSchema = z
  .string()
  .min(8)
  .max(256)
  .regex(/^cs_(test|live)_/, "Invalid checkout session");

export const redirectPathSchema = z
  .string()
  .max(200)
  .refine(
    (path) => path.startsWith("/") && !path.startsWith("//") && !path.includes("\\"),
    "Invalid redirect",
  );

export function safeInternalPath(value: string | null | undefined, fallback: string) {
  const parsed = redirectPathSchema.safeParse(value);
  return parsed.success ? parsed.data : fallback;
}
