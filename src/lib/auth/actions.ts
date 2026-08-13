import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { getServiceDb } from "@/db";
import { accounts, users } from "@/db/schema";
import { createSession } from "@/lib/auth/session";
import { BCRYPT_ROUNDS, DEFAULT_STORE_NAME } from "@/lib/config/constants";
import { AppError } from "@/lib/errors";
import { generateSlug } from "@/lib/utils/slug";

async function uniqueSlug(base: string) {
  const db = getServiceDb();
  let slug = generateSlug(base);
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(eq(accounts.slug, slug))
      .limit(1);
    if (existing.length === 0) return slug;
    slug = `${generateSlug(base)}-${counter}`;
    counter += 1;
  }
}

export async function signupUser(email: string, password: string) {
  const db = getServiceDb();
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const slug = await uniqueSlug(email.split("@")[0] ?? "store");

  const [account] = await db
    .insert(accounts)
    .values({
      name: DEFAULT_STORE_NAME,
      slug,
    })
    .returning();

  const [user] = await db
    .insert(users)
    .values({
      accountId: account.id,
      email: email.toLowerCase(),
      passwordHash,
    })
    .returning();

  await createSession({
    userId: user.id,
    accountId: account.id,
    email: user.email,
    accountName: account.name,
    accountSlug: account.slug,
  });

  return { user, account };
}

export async function loginUser(email: string, password: string) {
  const db = getServiceDb();
  const [row] = await db
    .select({
      user: users,
      account: accounts,
    })
    .from(users)
    .innerJoin(accounts, eq(users.accountId, accounts.id))
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  const valid = row
    ? await bcrypt.compare(password, row.user.passwordHash)
    : false;

  if (!row || !valid) {
    throw new AppError("Invalid email or password", 401);
  }

  await createSession({
    userId: row.user.id,
    accountId: row.user.accountId,
    email: row.user.email,
    accountName: row.account.name,
    accountSlug: row.account.slug,
  });

  return row.user;
}
