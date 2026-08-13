import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDownloadLinkBySession } from "@/lib/downloads/validate-token";
import { routes } from "@/lib/routes";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function ThankYouPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-bold mb-4">Thank you!</h1>
          <p className="text-[var(--muted)]">
            Your purchase is being processed. Check your email for confirmation from Stripe.
          </p>
        </Card>
      </div>
    );
  }

  const downloadPath = await getDownloadLinkBySession(sessionId);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-2">Thank you for your purchase!</h1>
        <p className="text-[var(--muted)] mb-6">
          Your payment was successful. Use the link below to download your file.
        </p>

        {downloadPath ? (
          <div className="space-y-4">
            <a href={downloadPath} className="btn btn-primary w-full">
              Download your file
            </a>
            <p className="text-xs text-[var(--muted)]">
              Link expires in 24 hours or after 3 downloads, whichever comes first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              Your order is being processed. Please refresh this page in a few seconds.
            </p>
            <Button
              variant="secondary"
              href={`${routes.thankYou}?session_id=${sessionId}`}
              className="w-full"
            >
              Refresh
            </Button>
          </div>
        )}

        <Link
          href={routes.home}
          className="block text-sm text-[var(--primary)] mt-6 hover:underline"
        >
          Back to home
        </Link>
      </Card>
    </div>
  );
}
