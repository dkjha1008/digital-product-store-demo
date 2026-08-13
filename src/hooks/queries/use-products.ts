"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { Product } from "@/db/schema";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "@/lib/products/actions";
import { queryKeys } from "@/lib/query/keys";
import { unwrapAction } from "@/lib/query/unwrap";
import { routes } from "@/lib/routes";

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: getProducts,
  });
}

export function useProduct(id: string, initialData?: Product) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
    initialData,
    enabled: Boolean(id),
  });
}

function useInvalidateCatalog() {
  const queryClient = useQueryClient();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
    ]);
}

export function useCreateProduct() {
  const router = useRouter();
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: async (formData: FormData) => unwrapAction(await createProduct(formData)),
    onSuccess: async () => {
      await invalidate();
      router.push(routes.products);
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: async (formData: FormData) =>
      unwrapAction(await updateProduct(id, formData)),
    onSuccess: async () => {
      await Promise.all([
        invalidate(),
        queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) }),
      ]);
      router.push(routes.products);
    },
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateCatalog();

  return useMutation({
    mutationFn: async (id: string) => unwrapAction(await deleteProduct(id)),
    onSuccess: () => invalidate(),
  });
}
