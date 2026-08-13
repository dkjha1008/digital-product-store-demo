"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb, withAccountContext } from "@/db";
import { products } from "@/db/schema";
import { requireSession } from "@/lib/auth/session";
import { DEFAULT_CURRENCY } from "@/lib/config/constants";
import { AppError, firstZodError } from "@/lib/errors";
import { logError } from "@/lib/logger";
import { uploadFile } from "@/lib/storage";
import type { ActionResult } from "@/lib/types";
import { productFormValues, productSchema } from "@/lib/validators/auth";
import { uuidSchema } from "@/lib/validators/common";

function parseProductForm(formData: FormData) {
  return productSchema.safeParse(productFormValues(formData));
}

function asFile(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}

export async function getProducts() {
  const session = await requireSession();
  return withAccountContext(session.accountId, async () => {
    return getDb()
      .select()
      .from(products)
      .where(eq(products.accountId, session.accountId))
      .orderBy(desc(products.createdAt));
  });
}

export async function getProduct(id: string) {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) return null;

  const session = await requireSession();
  return withAccountContext(session.accountId, async () => {
    const [product] = await getDb()
      .select()
      .from(products)
      .where(and(eq(products.id, parsedId.data), eq(products.accountId, session.accountId)))
      .limit(1);
    return product ?? null;
  });
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  const file = asFile(formData.get("file"));
  if (!file) {
    return { error: "Product file is required" };
  }

  try {
    const { key: fileKey, size } = await uploadFile(
      session.accountId,
      file,
      "product",
    );

    const thumbnail = asFile(formData.get("thumbnail"));
    const thumbnailKey = thumbnail
      ? (await uploadFile(session.accountId, thumbnail, "thumbnail")).key
      : undefined;

    await withAccountContext(session.accountId, async () => {
      await getDb().insert(products).values({
        accountId: session.accountId,
        name: parsed.data.name,
        description: parsed.data.description,
        priceMinor: parsed.data.priceMinor,
        currency: DEFAULT_CURRENCY,
        status: parsed.data.status,
        fileKey,
        fileName: file.name,
        fileSize: size,
        thumbnailKey,
      });
    });

    revalidatePath("/dashboard/products");
    return { ok: true };
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    logError("createProduct", err);
    return { error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "Product not found" };
  }

  const session = await requireSession();
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    return { error: firstZodError(parsed.error) };
  }

  try {
    const updates: {
      name: string;
      description?: string;
      priceMinor: number;
      currency: string;
      status: "draft" | "published";
      updatedAt: Date;
      fileKey?: string;
      fileName?: string;
      fileSize?: number;
      thumbnailKey?: string;
    } = {
      name: parsed.data.name,
      description: parsed.data.description,
      priceMinor: parsed.data.priceMinor,
      currency: DEFAULT_CURRENCY,
      status: parsed.data.status,
      updatedAt: new Date(),
    };

    const file = asFile(formData.get("file"));
    if (file) {
      const uploaded = await uploadFile(session.accountId, file, "product");
      updates.fileKey = uploaded.key;
      updates.fileName = file.name;
      updates.fileSize = uploaded.size;
    }

    const thumbnail = asFile(formData.get("thumbnail"));
    if (thumbnail) {
      updates.thumbnailKey = (
        await uploadFile(session.accountId, thumbnail, "thumbnail")
      ).key;
    }

    const updated = await withAccountContext(session.accountId, async () => {
      return getDb()
        .update(products)
        .set(updates)
        .where(and(eq(products.id, parsedId.data), eq(products.accountId, session.accountId)))
        .returning({ id: products.id });
    });

    if (updated.length === 0) {
      return { error: "Product not found" };
    }

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}/edit`);
    return { ok: true };
  } catch (err) {
    if (err instanceof AppError) return { error: err.message };
    logError("updateProduct", err);
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const parsedId = uuidSchema.safeParse(id);
  if (!parsedId.success) {
    return { error: "Product not found" };
  }

  const session = await requireSession();

  try {
    const deleted = await withAccountContext(session.accountId, async () => {
      return getDb()
        .delete(products)
        .where(and(eq(products.id, parsedId.data), eq(products.accountId, session.accountId)))
        .returning({ id: products.id });
    });

    if (deleted.length === 0) {
      return { error: "Product not found" };
    }

    revalidatePath("/dashboard/products");
    return { ok: true };
  } catch (err) {
    logError("deleteProduct", err);
    return { error: "Failed to delete product" };
  }
}
