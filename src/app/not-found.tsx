import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          The page you are looking for does not exist.
        </p>
        <Button href={routes.home}>Go home</Button>
      </Card>
    </div>
  );
}
