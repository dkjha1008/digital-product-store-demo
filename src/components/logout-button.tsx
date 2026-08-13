"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { postJson } from "@/lib/api/client";
import { apiRoutes, routes } from "@/lib/routes";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await postJson(apiRoutes.logout).catch(() => undefined);
    router.push(routes.login);
    router.refresh();
  }

  return (
    <Button variant="secondary" className="text-sm" onClick={handleLogout}>
      Log out
    </Button>
  );
}
