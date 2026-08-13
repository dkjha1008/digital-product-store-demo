import { and, eq, gt, lt, sql } from "drizzle-orm";

import { getServiceDb } from "@/db";
import { downloadTokens, orders, products } from "@/db/schema";
import { getEnv } from "@/lib/config/env";
import { hmacSha256, sha256 } from "@/lib/crypto";
import { getSignedDownloadUrl } from "@/lib/storage";

export function generateOrderDownloadToken(orderId: string): string {
  return hmacSha256(getEnv().SESSION_SECRET, orderId);
}

export async function getDownloadLinkBySession(sessionId: string) {
  const db = getServiceDb();

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);

  if (!order || order.paymentStatus !== "paid") {
    return null;
  }

  return `/api/download/${generateOrderDownloadToken(order.id)}`;
}

export async function processDownload(rawToken: string) {
  const db = getServiceDb();
  const tokenHash = sha256(rawToken);

  const [record] = await db
    .select({
      id: downloadTokens.id,
      downloadCount: downloadTokens.downloadCount,
      maxDownloads: downloadTokens.maxDownloads,
      expiresAt: downloadTokens.expiresAt,
      orderId: downloadTokens.orderId,
    })
    .from(downloadTokens)
    .where(eq(downloadTokens.tokenHash, tokenHash))
    .limit(1);

  if (!record) {
    return { error: "Invalid download link" as const };
  }

  if (new Date() > record.expiresAt) {
    return { error: "Download link has expired" as const };
  }

  if (record.downloadCount >= record.maxDownloads) {
    return { error: "Download limit reached" as const };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, record.orderId))
    .limit(1);

  if (!order || order.paymentStatus !== "paid") {
    return { error: "Order not found" as const };
  }

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, order.productId))
    .limit(1);

  if (!product) {
    return { error: "Product not found" as const };
  }

  const updated = await db
    .update(downloadTokens)
    .set({ downloadCount: sql`${downloadTokens.downloadCount} + 1` })
    .where(
      and(
        eq(downloadTokens.id, record.id),
        lt(downloadTokens.downloadCount, downloadTokens.maxDownloads),
        gt(downloadTokens.expiresAt, sql`now()`),
      ),
    )
    .returning({ downloadCount: downloadTokens.downloadCount });

  if (updated.length === 0) {
    return { error: "Download limit reached" as const };
  }

  const url = await getSignedDownloadUrl(product.fileKey, product.fileName);
  return { url, fileName: product.fileName };
}
