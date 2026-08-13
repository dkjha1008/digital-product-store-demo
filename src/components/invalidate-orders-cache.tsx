"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "@/lib/query/keys";

export function InvalidateOrdersCache() {
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
  }, [queryClient]);

  return null;
}
