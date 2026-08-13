import { z } from "zod";

import { DEFAULT_CURRENCY } from "@/lib/config/constants";
import {
  currencySchema,
  emailSchema,
  priceMinorSchema,
  slugSchema,
} from "@/lib/validators/common";

export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(128),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(100),
  slug: slugSchema,
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  description: z.preprocess(
    (value) => (value == null ? "" : value),
    z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(5000),
  ),
  priceMinor: priceMinorSchema,
  currency: currencySchema.default(DEFAULT_CURRENCY),
  status: z.enum(["draft", "published"], {
    errorMap: () => ({ message: "Status must be draft or published" }),
  }),
});

export function productFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    priceMinor: formData.get("priceMinor"),
    currency: DEFAULT_CURRENCY,
    status: formData.get("status"),
  };
}

export function settingsFormValues(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
  };
}

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type ProductInput = z.infer<typeof productSchema>;
