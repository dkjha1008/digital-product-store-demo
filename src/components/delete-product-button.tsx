"use client";

import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/queries/use-products";

type Props = {
  productId: string;
  productName: string;
};

export function DeleteProductButton({ productId, productName }: Props) {
  const { mutate, isPending } = useDeleteProduct();

  function handleDelete() {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
    mutate(productId);
  }

  return (
    <Button
      variant="danger"
      className="text-sm"
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}
