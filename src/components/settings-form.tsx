"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError, FormSuccess } from "@/components/ui/form-message";
import { useUpdateSettings } from "@/hooks/queries/use-settings";
import { settingsFormValues, settingsSchema } from "@/lib/validators/auth";
import { zodFieldErrors, type FieldErrors } from "@/lib/validators/parse";

type Props = {
  defaultName: string;
  defaultSlug: string;
};

export function SettingsForm({ defaultName, defaultSlug }: Props) {
  const { mutate, isPending, isSuccess, error } = useUpdateSettings();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = settingsSchema.safeParse(settingsFormValues(formData));
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setFieldErrors({});
    mutate(formData);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field label="Store name" htmlFor="name" error={fieldErrors.name}>
        <input
          id="name"
          name="name"
          defaultValue={defaultName}
          aria-invalid={Boolean(fieldErrors.name)}
        />
      </Field>
      <Field
        label="Store slug"
        htmlFor="slug"
        hint="Lowercase letters, numbers, and hyphens only"
        error={fieldErrors.slug}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--muted)]">/store/</span>
          <input
            id="slug"
            name="slug"
            defaultValue={defaultSlug}
            aria-invalid={Boolean(fieldErrors.slug)}
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
