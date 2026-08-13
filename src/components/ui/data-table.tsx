import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type Props = {
  columns: string[];
  children: ReactNode;
};

export function DataTable({ columns, children }: Props) {
  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-[var(--border)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className={`px-4 py-3 font-medium ${
                  column === "Actions" ? "text-right" : "text-left"
                }`}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </Card>
  );
}

export function TableRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[var(--border)] last:border-0">{children}</tr>
  );
}

export function TableCell({
  children,
  align = "left",
  muted = false,
}: {
  children: ReactNode;
  align?: "left" | "right";
  muted?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 ${align === "right" ? "text-right space-x-2" : ""} ${
        muted ? "text-[var(--muted)]" : ""
      }`}
    >
      {children}
    </td>
  );
}
