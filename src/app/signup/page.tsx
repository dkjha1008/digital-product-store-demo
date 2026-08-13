import { Suspense } from "react";

import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
      }
    >
      <AuthForm mode="signup" />
    </Suspense>
  );
}
