export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  products: "/dashboard/products",
  newProduct: "/dashboard/products/new",
  editProduct: (id: string) => `/dashboard/products/${id}/edit`,
  orders: "/dashboard/orders",
  settings: "/dashboard/settings",
  store: (slug: string) => `/store/${slug}`,
  storeProduct: (slug: string, id: string) => `/store/${slug}/products/${id}`,
  thankYou: "/thank-you",
} as const;

export const apiRoutes = {
  login: "/api/auth/login",
  signup: "/api/auth/signup",
  logout: "/api/auth/logout",
  checkout: "/api/checkout",
} as const;
