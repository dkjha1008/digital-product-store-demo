import { dirname } from "path";
import { fileURLToPath } from "url";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

import { createDb } from "../src/db/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const db = createDb(url);
  console.log("Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete.");
  await db.$client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
