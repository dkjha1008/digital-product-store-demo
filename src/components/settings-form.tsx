"use client";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/ui/form-message";
import { useUpdateSettings } from "@/hooks/queries/use-settings";

type Props = {
  defaultName: string;
  defaultSlug: string;
};

export function SettingsForm({ defaultName, defaultSlug }: Props) {
  const { mutate, isPending, isSuccess, error } = useUpdateSettings();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutate(new FormData(event.currentTarget));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Store name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={defaultName}
        />
      </Field>
      <Field
        label="Store slug"
        htmlFor="slug"
        hint="Lowercase letters, numbers, and hyphens only"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">/store/</span>
          <input
            id="slug"
            name="slug"
            required
            maxLength={48}
            pattern="[a-z0-9-]+"
            defaultValue={defaultSlug}
          />
        </div>
      </Field>
      <FormError message={error?.message} />
      <FormSuccess message={isSuccess ? "Settings saved successfully." : undefined} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
