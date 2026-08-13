import { and, eq } from "drizzle-orm";

import { getDb, withStoreSlugContext } from "@/db";
import { accounts, products } from "@/db/schema";
import { slugSchema } from "@/lib/validators/common";
import { storeProductParamSchema } from "@/lib/validators/params";

export async function getStorefront(slug: string) {
  const parsedSlug = slugSchema.safeParse(slug);
  if (!parsedSlug.success) return null;

  return withStoreSlugContext(parsedSlug.data, async () => {
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
      .where(eq(accounts.slug, parsedSlug.data));

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
  const parsed = storeProductParamSchema.safeParse({ slug, id: productId });
  if (!parsed.success) return null;

  return withStoreSlugContext(parsed.data.slug, async () => {
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
          eq(products.id, parsed.data.id),
          eq(products.status, "published"),
        ),
      )
      .where(eq(accounts.slug, parsed.data.slug))
      .limit(1);

    return row ?? null;
  });
}

export async function getPublishedProduct(slug: string, productId: string) {
  const row = await getStoreWithPublishedProduct(slug, productId);
  return row?.product ?? null;
}
