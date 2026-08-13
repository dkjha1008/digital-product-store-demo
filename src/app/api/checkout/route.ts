import { handleRouteError, jsonError, jsonOk } from "@/lib/http";
import { createCheckoutSession } from "@/lib/stripe/create-checkout";
import { checkoutSchema } from "@/lib/validators/checkout";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError("Invalid checkout request", 400);
    }

    const session = await createCheckoutSession(
      parsed.data.productId,
      parsed.data.slug,
    );

    if (!session.url) {
      return jsonError("Failed to create checkout session", 500);
    }

    return jsonOk({ url: session.url });
  } catch (err) {
    return handleRouteError("checkout", err, "Checkout failed");
  }
}
