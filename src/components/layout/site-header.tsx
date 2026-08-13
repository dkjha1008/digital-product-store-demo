import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type Props = {
  children: ReactNode;
  maxWidth?: "4xl" | "5xl";
  padding?: string;
};

export function SiteHeader({
  children,
  maxWidth = "4xl",
  padding = "py-4",
}: Props) {
  return (
    <header className="border-b border-[var(--border)] bg-white">
      <div
        className={cn(
          "mx-auto px-4 flex items-center justify-between",
          maxWidth === "5xl" ? "max-w-5xl" : "max-w-4xl",
          padding,
        )}
      >
        {children}
      </div>
    </header>
  );
}

export function BrandLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-lg">
      {children}
    </Link>
  );
}
