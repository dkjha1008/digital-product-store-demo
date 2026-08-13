import { notFound } from "next/navigation";

import { ProductEditView } from "@/components/product-edit-view";
import { getProduct } from "@/lib/products/actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductEditView productId={id} initialProduct={product} />;
}
