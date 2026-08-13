import Link from "next/link";

import { routes } from "@/lib/routes";

const links = [
  { href: routes.dashboard, label: "Overview" },
  { href: routes.products, label: "Products" },
  { href: routes.orders, label: "Orders" },
  { href: routes.settings, label: "Settings" },
];

export function DashboardNav() {
  return (
    <nav className="w-40 shrink-0 space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 text-sm rounded-md hover:bg-white hover:border-[var(--border)] border border-transparent"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
