"use server";

import { desc, eq } from "drizzle-orm";

import { getDb, withAccountContext } from "@/db";
import { orders, products } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";

export async function getOrders() {
  const session = await requireSession();
  return withAccountContext(session.accountId, async () => {
    return getDb()
      .select({
        id: orders.id,
        buyerEmail: orders.buyerEmail,
        amountMinor: orders.amountMinor,
        currency: orders.currency,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
        productName: products.name,
      })
      .from(orders)
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.accountId, session.accountId))
      .orderBy(desc(orders.createdAt));
  });
}
