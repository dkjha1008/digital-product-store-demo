"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-message";
import { useAsyncAction } from "@/hooks/use-async-action";
import { postJson } from "@/lib/api/client";
import { apiRoutes } from "@/lib/routes";
import { checkoutSchema } from "@/lib/validators/checkout";
import { zodFieldErrors, type FieldErrors } from "@/lib/validators/parse";

type Props = {
  productId: string;
  slug: string;
};

export function CheckoutForm({ productId, slug }: Props) {
  const { loading, error, setError, run } = useAsyncAction(
    "Could not start checkout. Please try again.",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = checkoutSchema.safeParse({
      productId,
      slug,
      email: formData.get("email"),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setError("");
      return;
    }

    setFieldErrors({});
    const data = await run(() =>
      postJson<{ url: string }>(apiRoutes.checkout, parsed.data),
    );
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Field
        label="Email"
        htmlFor="email"
        hint="Your download link will be issued for this email"
        error={fieldErrors.email}
      >
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
        />
      </Field>
      <FormError message={error} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Redirecting to payment..." : "Continue to payment"}
      </Button>
      <p className="text-xs text-[var(--muted)] text-center">
        Card details are entered securely on Stripe. Test card: 4242 4242 4242 4242
      </p>
    </form>
  );
}
