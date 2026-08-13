"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthShell } from "@/components/ui/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-message";
import { useAsyncAction } from "@/hooks/use-async-action";
import { postJson } from "@/lib/api/client";
import { apiRoutes, routes } from "@/lib/routes";

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, error, run } = useAsyncAction();
  const isSignup = mode === "signup";
  const redirect = searchParams.get("redirect") || routes.dashboard;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const result = await run(() =>
      postJson(isSignup ? apiRoutes.signup : apiRoutes.login, { email, password }),
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
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={isSignup ? "At least 8 characters" : undefined}
        >
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isSignup ? 8 : undefined}
            autoComplete={isSignup ? "new-password" : "current-password"}
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
