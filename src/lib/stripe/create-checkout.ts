import { getPublishedProduct } from "@/lib/store/queries";
import { getAppUrl, getStripe } from "@/lib/stripe/client";
import { AppError } from "@/lib/errors";
import { routes } from "@/lib/routes";

export async function createCheckoutSession(
  productId: string,
  slug: string,
  email: string,
) {
  const product = await getPublishedProduct(slug, productId);

  if (!product) {
    throw new AppError("Product not available", 404);
  }

  const stripe = getStripe();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceMinor,
          product_data: {
            name: product.name,
            description: product.description?.slice(0, 500) || undefined,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      product_id: product.id,
      account_id: product.accountId,
    },
    success_url: `${appUrl}${routes.thankYou}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}${routes.checkout(slug, product.id)}`,
  });

  return session;
}
