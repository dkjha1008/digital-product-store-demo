# MINI BLUEPRINT — Digital Product Store (Prototype Task)

**Purpose:** Evaluate developer skills before full-time engagement
**Scope:** A stripped-down multi-tenant SaaS where creators sell digital products
**Timeline:** 5 working days
**Deliverables:** GitHub repo + live deployed URL

---

## WHAT YOU'RE BUILDING

A multi-tenant web app where creators can sign up, list digital products (PDFs, templates, ebooks), and sell them via Stripe. Buyers visit the creator's storefront page and purchase with one-click checkout.

Think of it as: **a very simple Gumroad, but multi-tenant from day one.**

---

## REQUIREMENTS

### 1. Auth & Tenancy

- Creator signs up with email/password → an `account` (tenant) is auto-created
- Every data table carries `account_id`
- **Row-Level Security (RLS)** enforced at the database level — not just application-level filtering
- A creator can only see and modify their own data, enforced by Postgres RLS policies
- Basic session management (cookie-based or JWT — your choice)

### 2. Creator Dashboard

After login, the creator sees a simple dashboard with:

- **Products page** — CRUD for digital products:
  - Name, description, price (integer minor units — 1999 = $19.99), currency, status (draft/published)
  - File upload for the digital asset (store in local filesystem or any cloud storage — S3/R2/Supabase Storage)
  - Thumbnail image upload
- **Orders page** — list of purchases with: buyer email, product name, amount, date, payment status
- **Settings page** — update store name and slug (e.g. `app.com/store/maya`)

### 3. Public Storefront

- Each creator gets a public page at `/<slug>` (e.g. `/store/maya`)
- Displays: store name, list of published products with thumbnail, name, price
- Clicking a product → product detail page with description and "Buy Now" button

### 4. Checkout & Payments

- "Buy Now" → Stripe Checkout Session (hosted checkout is fine)
- Buyer enters email + card on Stripe's page
- On success → redirect to a thank-you page with a download link
- **Webhook handler** for `checkout.session.completed`:
  - Creates an `order` record in the database
  - Marks the digital asset as purchased for that buyer email
- All money stored as **integer minor units** (no floats, ever)
- Payment operations must be **idempotent** — processing the same webhook twice must not create duplicate orders

### 5. File Delivery

- After successful purchase, buyer gets a signed/time-limited download link
- Link expires after 24 hours or 3 downloads (whichever comes first)
- No public URLs to purchased files — ever

---

## TECH STACK

Your choice — but tell us what you picked and why. We're evaluating your architecture decisions, not enforcing a framework.

**Suggested (not required):**
- Next.js (App Router) or equivalent
- PostgreSQL with RLS
- Drizzle or Prisma for ORM
- Stripe (test mode)
- Tailwind CSS
- Deploy on Vercel, Railway, or similar

---

## DATA MODEL (Minimum)

You design the schema. At minimum, we expect these entities:

```
accounts       — the tenant (creator's store)
users          — creator login, linked to an account
products       — belongs to an account, has price/status/file
orders         — belongs to an account, links product + buyer
download_tokens — signed, expiring access to purchased files
```

**We're specifically looking at:**
- Does every tenant table have `account_id` + RLS policy?
- Are prices stored as integers, not floats?
- Is the schema normalized and clean?
- Are indexes on the right columns?

---

## WHAT WE'RE EVALUATING

This is not a feature checklist. We're evaluating how you work:

| What | Why it matters |
|---|---|
| **RLS implementation** | Our production app is multi-tenant — this is non-negotiable |
| **Payments handling** | Webhook processing, idempotency, no floats — this is where most devs cut corners |
| **Code structure** | Clean separation of concerns, not everything in one file |
| **Schema design** | Normalized, typed, migration files included |
| **Security basics** | No public file URLs, signed downloads, input validation |
| **Communication** | Send a daily update (3 lines: done / next / blocked) |
| **Deployment** | Ship it live, not "it works on my machine" |

---

## WHAT WE'RE NOT EVALUATING

- Pixel-perfect design (basic Tailwind is fine)
- Mobile responsiveness (nice to have, not required)
- Complex features (no email, no subscriptions, no analytics)
- Performance optimization (don't spend time on caching)

---

## DAILY UPDATES

During the 5 days, send a short update at the end of each working day:

```
DONE: [what you completed today]
NEXT: [what you'll work on tomorrow]
BLOCKED: [anything unclear or stuck — or "nothing"]
```

This is part of the evaluation. We work async and daily updates are how we stay aligned.

---

## DELIVERY

On day 5, send us:

1. **GitHub repo link** (clean commit history — we read the commits)
2. **Live URL** (deployed, working, with Stripe test mode)
3. **A short note** (3–5 sentences): what trade-offs you made and what you'd do differently with more time

---

## STRIPE TEST CREDENTIALS

Use your own Stripe test account. We'll verify the integration works by:
- Creating a product on your deployed app
- Completing a test purchase with Stripe's test card `4242 4242 4242 4242`
- Checking that the order appears in the dashboard
- Checking that the download link works and expires

---

*This is a prototype, not a production product. Build it clean, but don't over-engineer. We'd rather see a well-structured 80% than a messy 100%.*
