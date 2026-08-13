import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";

type Props = {
  productId: string;
  slug: string;
};

export function BuyNowButton({ productId, slug }: Props) {
  return (
    <Button
      href={routes.checkout(slug, productId)}
      className="text-base px-8 py-2"
    >
      Buy Now
    </Button>
  );
}
