"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function QueryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 rounded" />
      <div className="h-32 bg-gray-100 rounded" />
      <div className="h-32 bg-gray-100 rounded" />
    </div>
  );
}

export function QueryError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="text-center py-12">
      <p className="text-[var(--muted)] mb-4">
        {message || "Could not load data. Please try again."}
      </p>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </Card>
  );
}
