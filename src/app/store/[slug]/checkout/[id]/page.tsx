import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/checkout-form";
import { Card } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { getStoreWithPublishedProduct } from "@/lib/store/queries";
import { routes } from "@/lib/routes";
import { getThumbnailUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/utils/money";
import { storeProductParamSchema } from "@/lib/validators/params";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const raw = await params;
  const parsed = storeProductParamSchema.safeParse(raw);
  if (!parsed.success) {
    notFound();
  }

  const { slug, id } = parsed.data;
  const row = await getStoreWithPublishedProduct(slug, id);

  if (!row?.product) {
    notFound();
  }

  const { account, product } = row;
  const thumbUrl = product.thumbnailKey
    ? getThumbnailUrl(product.thumbnailKey)
    : null;
  const price = formatPrice(product.priceMinor, product.currency);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-xl mx-auto px-4 py-4">
          <Link
            href={routes.storeProduct(slug, product.id)}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            ← Back to {product.name}
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <Card className="space-y-6">
          <p className="text-sm text-[var(--muted)]">
            Buying from <span className="font-medium text-[var(--foreground)]">{account.name}</span>
          </p>

          <div className="flex gap-4">
            <ProductImage
              src={thumbUrl}
              alt={product.name}
              className="w-24 h-24 object-cover rounded-md border border-[var(--border)]"
              placeholderClassName="w-24 h-24 rounded-md shrink-0"
            />
            <div className="min-w-0">
              <h2 className="font-semibold">{product.name}</h2>
              {product.description ? (
                <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                  {product.description}
                </p>
              ) : null}
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Total</span>
            <span className="text-xl font-semibold">{price}</span>
          </div>

          <CheckoutForm productId={product.id} slug={slug} />
        </Card>
      </main>
    </div>
  );
}
