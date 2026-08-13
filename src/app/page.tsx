import { Button } from "@/components/ui/button";
import { BrandLink, SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth/session";
import { routes } from "@/lib/routes";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader>
        <BrandLink href={routes.home}>Digital Store</BrandLink>
        <nav className="flex gap-3">
          {session ? (
            <Button href={routes.dashboard}>Dashboard</Button>
          ) : (
            <>
              <Button variant="secondary" href={routes.login}>
                Log in
              </Button>
              <Button href={routes.signup}>Sign up</Button>
            </>
          )}
        </nav>
      </SiteHeader>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold mb-4">
            Sell digital products in minutes
          </h1>
          <p className="text-[var(--muted)] mb-8">
            A simple multi-tenant store for PDFs, templates, and ebooks.
            Sign up, upload your product, and start selling with Stripe.
          </p>
          {!session && (
            <Button href={routes.signup} className="text-base px-6 py-2">
              Get started free
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
