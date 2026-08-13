import { AsyncLocalStorage } from "node:async_hooks";
import { sql } from "drizzle-orm";

import { getServiceDb, type Db } from "./client";

type RlsStore = { db: Db };

const rlsAls = new AsyncLocalStorage<RlsStore>();

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Tenant-scoped DB client. Must run inside withAccountContext / withStoreSlugContext.
 * Those helpers SET LOCAL ROLE app_rls so Postgres RLS is actually applied
 * (the Neon owner role has BYPASSRLS and would otherwise ignore policies).
 */
export function getDb(): Db {
  const store = rlsAls.getStore();
  if (!store) {
    throw new Error(
      "getDb() must run inside withAccountContext() or withStoreSlugContext()",
    );
  }
  return store.db;
}

type RlsContext = {
  accountId?: string;
  storeSlug?: string;
};

async function runWithRls<T>(ctx: RlsContext, fn: () => Promise<T>): Promise<T> {
  const existing = rlsAls.getStore();
  if (existing) return fn();

  if (ctx.accountId && !UUID_RE.test(ctx.accountId)) {
    throw new Error("Invalid account id for RLS context");
  }

  const db = getServiceDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL ROLE app_rls`);
    await tx.execute(
      sql`SELECT set_config('app.current_account_id', ${ctx.accountId ?? ""}, true)`,
    );
    await tx.execute(
      sql`SELECT set_config('app.store_slug', ${ctx.storeSlug ?? ""}, true)`,
    );
    return rlsAls.run({ db: tx as unknown as Db }, fn);
  });
}

/** Dashboard / creator mutations: only this tenant's rows are visible. */
export async function withAccountContext<T>(
  accountId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return runWithRls({ accountId }, fn);
}

/** Public storefront: published products for this slug only. */
export async function withStoreSlugContext<T>(
  slug: string,
  fn: () => Promise<T>,
): Promise<T> {
  return runWithRls({ storeSlug: slug }, fn);
}
