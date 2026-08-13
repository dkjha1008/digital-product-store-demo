"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryKeys } from "@/lib/query/keys";
import { unwrapAction } from "@/lib/query/unwrap";
import {
  getAccountSettings,
  updateAccountSettings,
} from "@/lib/settings/actions";

export function useAccountSettings() {
  return useQuery({
    queryKey: queryKeys.settings.account,
    queryFn: getAccountSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) =>
      unwrapAction(await updateAccountSettings(formData)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.settings.account,
      });
      router.refresh();
    },
  });
}
