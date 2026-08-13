export const queryKeys = {
  products: {
    all: ["products"] as const,
    detail: (id: string) => ["products", id] as const,
  },
  orders: {
    all: ["orders"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
  settings: {
    account: ["settings", "account"] as const,
  },
} as const;
