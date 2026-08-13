import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getEnv } from "@/lib/config/env";
import { jsonError, jsonOk } from "@/lib/http";
import { logError } from "@/lib/logger";
import { getStripe } from "@/lib/stripe/client";
import {
  processCheckoutCompleted,
  recordWebhookEvent,
} from "@/lib/stripe/webhook-handler";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return jsonError("Missing signature", 400);
  }

  const webhookSecret = getEnv().STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.includes("...")) {
    logError("stripeWebhook", new Error("STRIPE_WEBHOOK_SECRET is not set"));
    return jsonError("Webhook not configured", 500);
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    logError("stripeWebhook.signature", err);
    return jsonError("Invalid signature", 400);
  }

  try {
    if (event.type === "checkout.session.completed") {
      await processCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    }

    await recordWebhookEvent(event.id, event.type);
    return jsonOk({ received: true });
  } catch (err) {
    logError("stripeWebhook.process", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
