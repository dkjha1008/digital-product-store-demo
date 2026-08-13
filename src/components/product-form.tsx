"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductFields } from "@/components/product-fields";
import { FormError } from "@/components/ui/form-message";
import type { Product } from "@/db/schema";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/queries/use-products";
import { PRODUCT_FILE_HINT, THUMBNAIL_FILE_HINT, isAllowedUpload } from "@/lib/config/constants";
import { routes } from "@/lib/routes";
import { productFormValues, productSchema } from "@/lib/validators/auth";
import { zodFieldErrors, type FieldErrors } from "@/lib/validators/parse";

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const isEdit = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? "");
  const mutation = isEdit ? updateProduct : createProduct;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = productSchema.safeParse(productFormValues(formData));
    const errors: FieldErrors = parsed.success ? {} : zodFieldErrors(parsed.error);

    const file = formData.get("file");
    if (!isEdit && (!(file instanceof File) || file.size === 0)) {
      errors.file = "Product file is required";
    } else if (file instanceof File && file.size > 0 && !isAllowedUpload(file, "product")) {
      errors.file = `Unsupported file type. ${PRODUCT_FILE_HINT}`;
    }

    const thumbnail = formData.get("thumbnail");
    if (
      thumbnail instanceof File &&
      thumbnail.size > 0 &&
      !isAllowedUpload(thumbnail, "thumbnail")
    ) {
      errors.thumbnail = `Unsupported thumbnail type. ${THUMBNAIL_FILE_HINT}`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    mutation.mutate(formData);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <ProductFields product={product} errors={fieldErrors} />
      <FormError message={mutation.error?.message} />
      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Create product"}
        </Button>
        <Button variant="secondary" href={routes.products}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
