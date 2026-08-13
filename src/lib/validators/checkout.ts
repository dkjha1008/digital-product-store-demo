import { z } from "zod";

export const checkoutSchema = z.object({
  productId: z.string().uuid("Invalid product"),
  slug: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9-]+$/),
});
