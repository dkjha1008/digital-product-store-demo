"use server";

import { sql } from "drizzle-orm";

import { getDb, withAccountContext } from "@/db";
import { requireSession } from "@/lib/auth/session";

export type DashboardStats = {
  products: number;
  orders: number;
  revenue: number;
};

function firstExecuteRow<T>(result: unknown): T | undefined {
  if (Array.isArray(result)) return result[0] as T;
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: T[] }).rows[0];
  }
  return undefined;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireSession();
  const stats = await withAccountContext(session.accountId, async () => {
    const rows = await getDb().execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM products WHERE account_id = ${session.accountId}) AS products,
        (SELECT COUNT(*)::int FROM orders WHERE account_id = ${session.accountId}) AS orders,
        (SELECT COALESCE(SUM(amount_minor), 0)::int FROM orders WHERE account_id = ${session.accountId}) AS revenue
    `);
    return firstExecuteRow<DashboardStats>(rows);
  });

  return {
    products: stats?.products ?? 0,
    orders: stats?.orders ?? 0,
    revenue: stats?.revenue ?? 0,
  };
}
