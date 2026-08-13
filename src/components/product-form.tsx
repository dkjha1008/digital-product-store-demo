"use client";

import { Button } from "@/components/ui/button";
import { ProductFields } from "@/components/product-fields";
import { FormError } from "@/components/ui/form-message";
import type { Product } from "@/db/schema";
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/queries/use-products";
import { routes } from "@/lib/routes";

type Props = {
  product?: Product;
};

export function ProductForm({ product }: Props) {
  const isEdit = Boolean(product);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? "");
  const mutation = isEdit ? updateProduct : createProduct;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ProductFields product={product} fileRequired={!isEdit} />
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
