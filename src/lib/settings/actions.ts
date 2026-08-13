"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, withAccountContext } from "@/db";
import { accounts } from "@/db/schema";
import { createSession, requireSession } from "@/lib/auth/session";
import { firstZodError, isUniqueViolation } from "@/lib/errors";
import { logError } from "@/lib/logger";
import type { ActionResult } from "@/lib/types";
import { RESERVED_SLUGS } from "@/lib/utils/slug";
import { settingsFormValues, settingsSchema } from "@/lib/validators/auth";

export async function getAccountSettings() {
  const session = await requireSession();
  return withAccountContext(session.accountId, async () => {
    const [account] = await getDb()
      .select()
      .from(accounts)
      .where(eq(accounts.id, session.accountId))
      .limit(1);
    return account ?? null;
  });
}

export async function updateAccountSettings(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = settingsSchema.safeParse(settingsFormValues(formData));

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  if (RESERVED_SLUGS.has(parsed.data.slug)) {
    return { error: "This slug is reserved" };
  }

  try {
    await withAccountContext(session.accountId, async () => {
      await getDb()
        .update(accounts)
        .set({
          name: parsed.data.name,
          slug: parsed.data.slug,
          updatedAt: new Date(),
        })
        .where(eq(accounts.id, session.accountId));
    });

    await createSession({
      userId: session.userId,
      accountId: session.accountId,
      email: session.email,
      accountName: parsed.data.name,
      accountSlug: parsed.data.slug,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    revalidatePath(`/store/${parsed.data.slug}`);
    return { ok: true };
  } catch (err) {
    if (isUniqueViolation(err)) {
      return { error: "Slug is already taken" };
    }
    logError("updateAccountSettings", err);
    return { error: "Failed to update settings" };
  }
}
