import { eq } from "drizzle-orm";

import { getDb, getServiceDb, withAccountContext } from "@/db";
import {
  downloadTokens,
  orders,
  products,
  webhookEvents,
} from "@/db/schema";
import {
  DEFAULT_CURRENCY,
  DOWNLOAD_EXPIRY_HOURS,
  DOWNLOAD_MAX,
} from "@/lib/config/constants";
import { sha256 } from "@/lib/crypto";
import { generateOrderDownloadToken } from "@/lib/downloads/validate-token";
import { AppError } from "@/lib/errors";
import { parseInput } from "@/lib/validators/parse";
import { checkoutCompletedSchema } from "@/lib/validators/webhook";

export async function processCheckoutCompleted(session: {
  id: string;
  payment_intent?: string | { id: string } | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
  metadata?: Record<string, string> | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
}) {
  const parsed = parseInput(checkoutCompletedSchema, session);
  if (!parsed.success) {
    throw new AppError(parsed.error, 400);
  }

  const productId = parsed.data.metadata.product_id;
  const accountId = parsed.data.metadata.account_id;

  return withAccountContext(accountId, async () => {
    const db = getDb();

    const buyerEmail =
      parsed.data.customer_email ||
      parsed.data.customer_details?.email ||
      "unknown@checkout.stripe";

    const paymentIntentId =
      typeof parsed.data.payment_intent === "string"
        ? parsed.data.payment_intent
        : parsed.data.payment_intent?.id ?? null;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const amountMinor =
      parsed.data.currency === "USD" && parsed.data.amount_total != null
        ? parsed.data.amount_total
        : product.priceMinor;
    const currency = DEFAULT_CURRENCY;

    const [order] = await db
      .insert(orders)
      .values({
        accountId,
        productId,
        buyerEmail,
        amountMinor,
        currency,
        paymentStatus: parsed.data.payment_status === "paid" ? "paid" : "pending",
        stripeCheckoutSessionId: parsed.data.id,
        stripePaymentIntentId: paymentIntentId,
      })
      .onConflictDoNothing({ target: orders.stripeCheckoutSessionId })
      .returning();

    if (!order) {
      const [existing] = await db
        .select({ id: orders.id, paymentStatus: orders.paymentStatus })
        .from(orders)
        .where(eq(orders.stripeCheckoutSessionId, parsed.data.id))
        .limit(1);

      if (!existing) {
        throw new AppError("Order not found", 404);
      }

      if (
        existing.paymentStatus !== "paid" &&
        parsed.data.payment_status === "paid"
      ) {
        await db
          .update(orders)
          .set({
            paymentStatus: "paid",
            stripePaymentIntentId: paymentIntentId,
          })
          .where(eq(orders.id, existing.id));
      }

      return { orderId: existing.id, alreadyProcessed: true };
    }

    const rawToken = generateOrderDownloadToken(order.id);
    const expiresAt = new Date(
      Date.now() + DOWNLOAD_EXPIRY_HOURS * 60 * 60 * 1000,
    );

    await db
      .insert(downloadTokens)
      .values({
        accountId,
        orderId: order.id,
        tokenHash: sha256(rawToken),
        maxDownloads: DOWNLOAD_MAX,
        expiresAt,
      })
      .onConflictDoNothing({ target: downloadTokens.orderId });

    return { orderId: order.id, downloadToken: rawToken, alreadyProcessed: false };
  });
}

export async function recordWebhookEvent(
  stripeEventId: string,
  eventType: string,
) {
  const db = getServiceDb();
  const inserted = await db
    .insert(webhookEvents)
    .values({ stripeEventId, eventType })
    .onConflictDoNothing({ target: webhookEvents.stripeEventId })
    .returning({ id: webhookEvents.id });

  return inserted.length > 0;
}
