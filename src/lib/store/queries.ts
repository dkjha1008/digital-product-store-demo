import { and, eq } from "drizzle-orm";

import { getDb, withStoreSlugContext } from "@/db";
import { accounts, products } from "@/db/schema";

export async function getStorefront(slug: string) {
  return withStoreSlugContext(slug, async () => {
    const rows = await getDb()
      .select({
        account: accounts,
        product: products,
      })
      .from(accounts)
      .leftJoin(
        products,
        and(eq(products.accountId, accounts.id), eq(products.status, "published")),
      )
      .where(eq(accounts.slug, slug));

    if (rows.length === 0) return null;

    return {
      account: rows[0].account,
      products: rows
        .map((row) => row.product)
        .filter((product): product is NonNullable<typeof product> => Boolean(product)),
    };
  });
}

export async function getStoreWithPublishedProduct(slug: string, productId: string) {
  return withStoreSlugContext(slug, async () => {
    const [row] = await getDb()
      .select({
        account: accounts,
        product: products,
      })
      .from(accounts)
      .leftJoin(
        products,
        and(
          eq(products.accountId, accounts.id),
          eq(products.id, productId),
          eq(products.status, "published"),
        ),
      )
      .where(eq(accounts.slug, slug))
      .limit(1);

    return row ?? null;
  });
}

export async function getPublishedProduct(slug: string, productId: string) {
  const row = await getStoreWithPublishedProduct(slug, productId);
  return row?.product ?? null;
}
