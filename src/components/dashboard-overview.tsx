"use client";

import { QueryError, QueryLoading } from "@/components/query-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboardStats } from "@/hooks/queries/use-dashboard";
import { routes } from "@/lib/routes";
import { formatPrice } from "@/lib/utils/money";

export function DashboardOverview() {
  const { data: stats, isPending, isError, error, refetch } = useDashboardStats();

  if (isPending) return <QueryLoading />;
  if (isError) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div>
      <PageHeader title="Overview" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm text-[var(--muted)]">Products</p>
          <p className="text-2xl font-bold">{stats.products}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Orders</p>
          <p className="text-2xl font-bold">{stats.orders}</p>
        </Card>
        <Card>
          <p className="text-sm text-[var(--muted)]">Revenue</p>
          <p className="text-2xl font-bold">{formatPrice(stats.revenue)}</p>
        </Card>
      </div>
      <div className="flex gap-3">
        <Button href={routes.newProduct}>Add product</Button>
        <Button variant="secondary" href={routes.settings}>
          Store settings
        </Button>
      </div>
    </div>
  );
}
