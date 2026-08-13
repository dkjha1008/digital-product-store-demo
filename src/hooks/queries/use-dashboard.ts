"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardStats } from "@/lib/dashboard/stats";
import { queryKeys } from "@/lib/query/keys";

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: getDashboardStats,
  });
}
