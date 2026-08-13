"use client";

import { SettingsForm } from "@/components/settings-form";
import { QueryError, QueryLoading } from "@/components/query-state";
import { FormPage } from "@/components/ui/form-page";
import { useAccountSettings } from "@/hooks/queries/use-settings";

export function SettingsView() {
  const { data: account, isPending, isError, error, refetch } =
    useAccountSettings();

  if (isPending) return <QueryLoading />;
  if (isError) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }
  if (!account) return null;

  return (
    <FormPage title="Store settings">
      <SettingsForm defaultName={account.name} defaultSlug={account.slug} />
    </FormPage>
  );
}
