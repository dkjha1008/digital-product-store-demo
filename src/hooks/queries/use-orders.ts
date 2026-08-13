"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrders } from "@/lib/orders/actions";
import { queryKeys } from "@/lib/query/keys";

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: getOrders,
  });
}
