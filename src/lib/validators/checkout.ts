import { z } from "zod";

import { emailSchema, slugSchema, uuidSchema } from "@/lib/validators/common";

export const checkoutSchema = z.object({
  productId: uuidSchema,
  slug: slugSchema,
  email: emailSchema,
});
