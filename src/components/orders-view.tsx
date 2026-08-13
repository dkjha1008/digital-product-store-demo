"use client";

import { QueryError, QueryLoading } from "@/components/query-state";
import { Badge } from "@/components/ui/badge";
import { DataTable, TableCell, TableRow } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useOrders } from "@/hooks/queries/use-orders";
import { formatPrice } from "@/lib/utils/money";

export function OrdersView() {
  const { data: orders, isPending, isError, error, refetch } = useOrders();

  if (isPending) return <QueryLoading />;
  if (isError) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader title="Orders" />

      {orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <DataTable columns={["Buyer", "Product", "Amount", "Status", "Date"]}>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.buyerEmail}</TableCell>
              <TableCell>{order.productName}</TableCell>
              <TableCell>
                {formatPrice(order.amountMinor, order.currency)}
              </TableCell>
              <TableCell>
                <Badge tone={order.paymentStatus}>{order.paymentStatus}</Badge>
              </TableCell>
              <TableCell muted>
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      )}
    </div>
  );
}
