import { DashboardNav } from "@/components/dashboard-nav";
import { LogoutButton } from "@/components/logout-button";
import { BrandLink, SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth/session";
import { routes } from "@/lib/routes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader maxWidth="5xl">
        <div>
          <BrandLink href={routes.dashboard}>
            {session.accountName || "Dashboard"}
          </BrandLink>
          {session.accountSlug ? (
            <p className="text-xs text-[var(--muted)]">
              /store/{session.accountSlug}
            </p>
          ) : null}
        </div>
        <LogoutButton />
      </SiteHeader>

      <div className="max-w-5xl mx-auto px-4 py-6 w-full flex gap-8">
        <DashboardNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
