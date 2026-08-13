"use client";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-message";
import { useAsyncAction } from "@/hooks/use-async-action";
import { postJson } from "@/lib/api/client";
import { apiRoutes } from "@/lib/routes";

type Props = {
  productId: string;
  slug: string;
};

export function BuyNowButton({ productId, slug }: Props) {
  const { loading, error, run } = useAsyncAction();

  async function handleBuy() {
    const data = await run(() =>
      postJson<{ url: string }>(apiRoutes.checkout, { productId, slug }),
    );
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div>
      <Button
        className="text-base px-8 py-2"
        disabled={loading}
        onClick={handleBuy}
      >
        {loading ? "Redirecting..." : "Buy Now"}
      </Button>
      <FormError message={error} className="mt-2" />
    </div>
  );
}
