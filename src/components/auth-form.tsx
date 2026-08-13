"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/ui/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-message";
import { useAsyncAction } from "@/hooks/use-async-action";
import { postJson } from "@/lib/api/client";
import { apiRoutes, routes } from "@/lib/routes";
import { loginSchema, signupSchema } from "@/lib/validators/auth";
import { safeInternalPath } from "@/lib/validators/common";
import { zodFieldErrors, type FieldErrors } from "@/lib/validators/parse";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, setError, run } = useAsyncAction();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const isSignup = mode === "signup";
  const redirect = safeInternalPath(searchParams.get("redirect"), routes.dashboard);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = (isSignup ? signupSchema : loginSchema).safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      setError("");
      return;
    }

    setFieldErrors({});
    const result = await run(() =>
      postJson(isSignup ? apiRoutes.signup : apiRoutes.login, parsed.data),
    );
    if (!result) return;

    router.push(isSignup ? routes.dashboard : redirect);
    router.refresh();
  }

  return (
    <AuthShell>
      <h1 className={`text-xl font-bold ${isSignup ? "mb-2" : "mb-6"}`}>
        {isSignup ? "Create your store" : "Log in to your store"}
      </h1>
      {isSignup ? (
        <p className="text-sm text-[var(--muted)] mb-6">
          Sign up and your store account will be created automatically.
        </p>
      ) : null}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="email" error={fieldErrors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={isSignup ? "At least 8 characters" : undefined}
          error={fieldErrors.password}
        >
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignup ? "new-password" : "current-password"}
            aria-invalid={Boolean(fieldErrors.password)}
          />
        </Field>
        <FormError message={error} />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? isSignup
              ? "Creating account..."
              : "Logging in..."
            : isSignup
              ? "Sign up"
              : "Log in"}
        </Button>
      </form>
      <p className="text-sm text-[var(--muted)] mt-4 text-center">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href={routes.login} className="text-[var(--primary)] hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            No account?{" "}
            <Link href={routes.signup} className="text-[var(--primary)] hover:underline">
              Sign up
            </Link>
          </>
        )}
      </p>
    </AuthShell>
  );
}
