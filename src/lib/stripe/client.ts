import Stripe from "stripe";

import { getEnv } from "@/lib/config/env";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!stripeClient) {
    const key = getEnv().STRIPE_SECRET_KEY;
    if (!key || key.includes("...")) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return stripeClient;
}

export function getAppUrl() {
  return getEnv().APP_URL;
}
