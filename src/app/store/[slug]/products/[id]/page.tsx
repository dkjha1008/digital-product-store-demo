import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyNowButton } from "@/components/buy-now-button";
import { ProductImage } from "@/components/ui/product-image";
import { getStoreWithPublishedProduct } from "@/lib/store/queries";
import { routes } from "@/lib/routes";
import { getThumbnailUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/utils/money";

type Props = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { slug, id } = await params;
  const row = await getStoreWithPublishedProduct(slug, id);

  if (!row?.product) {
    notFound();
  }

  const { account, product } = row;
  const thumbUrl = product.thumbnailKey
    ? getThumbnailUrl(product.thumbnailKey)
    : null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={routes.store(slug)}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            ← Back to {account.name}
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ProductImage
              src={thumbUrl}
              alt={product.name}
              className="w-full rounded-lg border border-[var(--border)]"
              placeholderClassName="w-full h-64 rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-semibold text-[var(--primary)] mb-6">
              {formatPrice(product.priceMinor, product.currency)}
            </p>
            {product.description ? (
              <p className="text-[var(--muted)] mb-8 whitespace-pre-wrap">
                {product.description}
              </p>
            ) : null}
            <BuyNowButton productId={product.id} slug={slug} />
          </div>
        </div>
      </main>
    </div>
  );
}
