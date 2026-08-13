export function generateSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "store"
  );
}

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "store",
  "dashboard",
  "login",
  "signup",
  "thank-you",
]);
