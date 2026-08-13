"use client";

import Link from "next/link";

import { DeleteProductButton } from "@/components/delete-product-button";
import { QueryError, QueryLoading } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, TableCell, TableRow } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useProducts } from "@/hooks/queries/use-products";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/utils/money";

export function ProductsView() {
  const { data: products, isPending, isError, error, refetch } = useProducts();

  if (isPending) return <QueryLoading />;
  if (isError) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader
        title="Products"
        action={<Button href={routes.newProduct}>Add product</Button>}
      />

      {products.length === 0 ? (
        <EmptyState
          message="No products yet."
          action={<Button href={routes.newProduct}>Create your first product</Button>}
        />
      ) : (
        <DataTable columns={["Name", "Price", "Status", "Actions"]}>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>
                {formatPrice(product.priceMinor, product.currency)}
              </TableCell>
              <TableCell>
                <Badge tone={product.status}>{product.status}</Badge>
              </TableCell>
              <TableCell align="right">
                <Link
                  href={routes.editProduct(product.id)}
                  className="text-[var(--primary)] hover:underline"
                >
                  Edit
                </Link>
                <DeleteProductButton
                  productId={product.id}
                  productName={product.name}
                />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
