import { z } from "zod";

import { DEFAULT_CURRENCY } from "@/lib/config/constants";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const settingsSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(48)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().max(5000).optional(),
  priceMinor: z.coerce.number().int().min(0, "Price must be non-negative"),
  currency: z
    .string()
    .length(3)
    .transform((value) => value.toUpperCase())
    .default(DEFAULT_CURRENCY),
  status: z.enum(["draft", "published"]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProductInput = z.infer<typeof productSchema>;
