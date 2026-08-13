# Digital Product Store

A multi-tenant SaaS prototype where creators sell digital products (PDFs, templates, ebooks) via Stripe Checkout.

Built per [MINI-BLUEPRINT.md](./MINI-BLUEPRINT.md) with architecture documented in [TECHNICAL-ARCHITECTURE.md](./TECHNICAL-ARCHITECTURE.md).

## Features

- **Auth & tenancy** — Email/password signup auto-creates an account; Postgres RLS enforces tenant isolation
- **Creator dashboard** — Products CRUD, orders list, store settings (name + slug)
- **Public storefront** — `/store/{slug}` with product listings and detail pages
- **Stripe Checkout** — Hosted payments with idempotent webhook processing
- **Secure downloads** — Time-limited links (24h or 3 downloads); no public file URLs

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL with Row-Level Security |
| ORM | Drizzle ORM |
| Auth | JWT session cookies (jose) |
| Payments | Stripe Checkout + Webhooks |
| Storage | Local filesystem (dev) or S3-compatible (R2/Supabase) |
| Deployment | Vercel + Neon/Supabase Postgres |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL` — PostgreSQL connection string (Neon, Supabase, or local)
- `SESSION_SECRET` — At least 32 random characters
- `APP_URL` — `http://localhost:3000` for local dev
- `STRIPE_SECRET_KEY` — Stripe test secret key
- `STRIPE_WEBHOOK_SECRET` — From Stripe CLI or dashboard
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe test publishable key

Optional (S3-compatible storage for production):

- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`

Without S3 config, files are stored locally in `./uploads/`.

### 3. Run database migrations

Apply the schema and RLS policies:

```bash
# Option A: run SQL directly against your Postgres instance
psql $DATABASE_URL -f drizzle/0000_init.sql
psql $DATABASE_URL -f drizzle/0001_rls_enforcement.sql

# Option B: drizzle-kit migrate (requires DATABASE_URL)
npm run db:migrate
```

Tenant queries connect as the database owner, then `SET LOCAL ROLE app_rls` inside a transaction so Postgres RLS is actually applied. Auth, Stripe webhooks, and download-token lookups use the owner connection (service role) because those paths are not tenant-scoped.

### 4. Start Stripe webhook forwarding (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing the Purchase Flow

1. Sign up as a creator
2. Create a product (upload a file, set price in cents, publish)
3. Update store slug in Settings
4. Visit `/store/{your-slug}`
5. Click **Buy Now** and pay with test card `4242 4242 4242 4242`
6. Verify order appears in dashboard
7. Download file from thank-you page; confirm link expires after 3 downloads or 24 hours

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # Auth, checkout, webhooks, downloads
│   ├── dashboard/          # Creator dashboard
│   ├── store/[slug]/       # Public storefront
│   └── thank-you/          # Post-purchase page
├── components/             # UI components
├── db/                     # Drizzle schema, RLS context helpers
└── lib/                    # Auth, Stripe, storage, validators
drizzle/                    # SQL migrations + RLS policies
```

## Deployment

1. Push to GitHub
2. Deploy to Vercel
3. Set environment variables in Vercel dashboard
4. Run migration SQL against production Postgres
5. Configure Stripe webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
6. Select event: `checkout.session.completed`

## Trade-offs

- **RLS via session variables** — Uses `set_config('app.current_account_id')` per request rather than Supabase Auth integration; portable across Postgres hosts
- **Deterministic download tokens** — HMAC-derived from order ID for thank-you page lookup; hash stored in DB for validation
- **Local file storage in dev** — S3-compatible storage recommended for production
- **No email delivery** — Per blueprint scope; buyers use thank-you page download link

## License

Private — prototype for evaluation purposes.
