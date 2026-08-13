"use client";

import { ProductForm } from "@/components/product-form";
import { QueryError, QueryLoading } from "@/components/query-state";
import { FormPage } from "@/components/ui/form-page";
import type { Product } from "@/db/schema";
import { useProduct } from "@/hooks/queries/use-products";

type Props = {
  productId: string;
  initialProduct: Product;
};

export function ProductEditView({ productId, initialProduct }: Props) {
  const { data: product, isPending, isError, error, refetch } = useProduct(
    productId,
    initialProduct,
  );

  if (isPending) return <QueryLoading />;
  if (isError) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }
  if (!product) return null;

  return (
    <FormPage title="Edit product">
      <ProductForm product={product} />
    </FormPage>
  );
}
