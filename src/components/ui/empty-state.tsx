import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type Props = {
  message: string;
  action?: ReactNode;
};

export function EmptyState({ message, action }: Props) {
  return (
    <Card className="text-center py-12">
      <p className="text-[var(--muted)] mb-4 last:mb-0">{message}</p>
      {action}
    </Card>
  );
}
