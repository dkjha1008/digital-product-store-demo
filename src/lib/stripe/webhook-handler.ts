import { eq } from "drizzle-orm";

import { getDb, getServiceDb, withAccountContext } from "@/db";
import {
  downloadTokens,
  orders,
  products,
  webhookEvents,
} from "@/db/schema";
import {
  DOWNLOAD_EXPIRY_HOURS,
  DOWNLOAD_MAX,
} from "@/lib/config/constants";
import { sha256 } from "@/lib/crypto";
import { generateOrderDownloadToken } from "@/lib/downloads/validate-token";
import { AppError } from "@/lib/errors";

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
  const productId = session.metadata?.product_id;
  const accountId = session.metadata?.account_id;

  if (!productId || !accountId) {
    throw new AppError("Missing metadata on checkout session", 400);
  }

  return withAccountContext(accountId, async () => {
    const db = getDb();

    const buyerEmail =
      session.customer_email ||
      session.customer_details?.email ||
      "unknown@checkout.stripe";

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const amountMinor = session.amount_total ?? product.priceMinor;
    const currency = (session.currency ?? product.currency).toUpperCase();

    const [order] = await db
      .insert(orders)
      .values({
        accountId,
        productId,
        buyerEmail,
        amountMinor,
        currency,
        paymentStatus: session.payment_status === "paid" ? "paid" : "pending",
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
      })
      .onConflictDoNothing({ target: orders.stripeCheckoutSessionId })
      .returning();

    if (!order) {
      const [existing] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.stripeCheckoutSessionId, session.id))
        .limit(1);
      return { orderId: existing!.id, alreadyProcessed: true };
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
