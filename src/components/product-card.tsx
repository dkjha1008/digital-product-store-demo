import Link from "next/link";

import { ProductImage } from "@/components/ui/product-image";
import type { Product } from "@/db/schema";
import { routes } from "@/lib/routes";
import { getThumbnailUrl } from "@/lib/storage";
import { formatPrice } from "@/lib/utils/money";

type Props = {
  product: Product;
  slug: string;
};

export function ProductCard({ product, slug }: Props) {
  const thumbUrl = product.thumbnailKey
    ? getThumbnailUrl(product.thumbnailKey)
    : null;

  return (
    <Link
      href={routes.storeProduct(slug, product.id)}
      className="card hover:border-[var(--primary)] transition-colors block"
    >
      <ProductImage
        src={thumbUrl}
        alt={product.name}
        className="w-full h-40 object-cover rounded mb-4"
        placeholderClassName="w-full h-40 rounded mb-4"
      />
      <h2 className="font-semibold text-lg">{product.name}</h2>
      <p className="text-[var(--primary)] font-medium mt-2">
        {formatPrice(product.priceMinor, product.currency)}
      </p>
    </Link>
  );
}
