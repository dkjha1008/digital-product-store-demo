import { z } from "zod";

import { currencySchema, uuidSchema } from "@/lib/validators/common";

const optionalEmail = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.string().email().max(254).optional(),
);

export const checkoutCompletedSchema = z.object({
  id: z.string().min(8).max(256),
  payment_intent: z
    .union([z.string().min(1).max(256), z.object({ id: z.string().min(1).max(256) })])
    .nullish(),
  customer_email: optionalEmail,
  customer_details: z
    .object({
      email: optionalEmail,
    })
    .nullish(),
  metadata: z.object({
    product_id: uuidSchema,
    account_id: uuidSchema,
  }),
  amount_total: z.number().int().nonnegative().nullish(),
  currency: currencySchema.nullish(),
  payment_status: z.string().max(32).nullish(),
});

export type CheckoutCompletedInput = z.infer<typeof checkoutCompletedSchema>;
