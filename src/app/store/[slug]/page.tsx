import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { getStorefront } from "@/lib/store/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const store = await getStorefront(slug);

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">{store.account.name}</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Digital products</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {store.products.length === 0 ? (
          <p className="text-[var(--muted)] text-center py-12">
            No products available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {store.products.map((product) => (
              <ProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
