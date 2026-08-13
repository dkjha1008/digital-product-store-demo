import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { getEnv } from "@/lib/config/env";
import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

export type Db = ReturnType<typeof createDb>;

export function createDb(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 1 : 5,
  });
  return drizzle(pool, { schema });
}

const globalForDb = globalThis as unknown as { db?: Db };

/** Owner/admin connection. Bypasses RLS (neon_superuser BYPASSRLS). */
export function getServiceDb() {
  if (globalForDb.db) return globalForDb.db;
  globalForDb.db = createDb(getEnv().DATABASE_URL);
  return globalForDb.db;
}
