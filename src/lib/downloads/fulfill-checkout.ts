import { getStripe } from "@/lib/stripe/client";
import { processCheckoutCompleted } from "@/lib/stripe/webhook-handler";
import { logError } from "@/lib/logger";
import { stripeCheckoutSessionIdSchema } from "@/lib/validators/common";

import { getDownloadLinkBySession } from "./validate-token";

export async function fulfillCheckoutAndGetDownloadLink(sessionId: string) {
  const parsed = stripeCheckoutSessionIdSchema.safeParse(sessionId);
  if (!parsed.success) return null;

  const existing = await getDownloadLinkBySession(parsed.data);
  if (existing) return existing;

  try {
    const session = await getStripe().checkout.sessions.retrieve(parsed.data);

    if (session.payment_status !== "paid") {
      return null;
    }

    await processCheckoutCompleted({
      id: session.id,
      payment_intent: session.payment_intent,
      customer_email: session.customer_email,
      customer_details: session.customer_details,
      metadata: session.metadata,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
    });
  } catch (err) {
    logError("fulfillCheckout", err);
  }

  return getDownloadLinkBySession(parsed.data);
}
