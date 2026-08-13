import { z } from "zod";

import {
  downloadFileNameSchema,
  downloadTokenSchema,
  slugSchema,
  storageKeySchema,
  stripeCheckoutSessionIdSchema,
  uuidSchema,
} from "@/lib/validators/common";

export const storeSlugParamSchema = z.object({
  slug: slugSchema,
});

export const storeProductParamSchema = z.object({
  slug: slugSchema,
  id: uuidSchema,
});

export const productIdParamSchema = z.object({
  id: uuidSchema,
});

export const downloadTokenParamSchema = z.object({
  token: downloadTokenSchema,
});

export const fileQuerySchema = z.object({
  key: storageKeySchema,
  name: downloadFileNameSchema,
});

export const thankYouQuerySchema = z.object({
  session_id: stripeCheckoutSessionIdSchema,
});
