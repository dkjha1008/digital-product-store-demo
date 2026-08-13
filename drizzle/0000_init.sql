-- Initial schema + Row-Level Security policies
-- Run via: npm run db:migrate

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'published');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL DEFAULT 'My Store',
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_account_id ON users (account_id);

CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id     UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  description    TEXT,
  price_minor    INTEGER NOT NULL CHECK (price_minor >= 0),
  currency       CHAR(3) NOT NULL DEFAULT 'USD',
  status         product_status NOT NULL DEFAULT 'draft',
  file_key       TEXT NOT NULL,
  file_name      TEXT NOT NULL,
  file_size      BIGINT,
  thumbnail_key  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_account_id ON products (account_id);
CREATE INDEX IF NOT EXISTS idx_products_account_status ON products (account_id, status);

CREATE TABLE IF NOT EXISTS orders (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id                 UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  product_id                 UUID NOT NULL REFERENCES products(id),
  buyer_email                TEXT NOT NULL,
  amount_minor               INTEGER NOT NULL,
  currency                   CHAR(3) NOT NULL,
  payment_status             payment_status NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id   TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_account_id ON orders (account_id);
CREATE INDEX IF NOT EXISTS idx_orders_account_created ON orders (account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS download_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,
  download_count  INTEGER NOT NULL DEFAULT 0,
  max_downloads   INTEGER NOT NULL DEFAULT 3,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_download_tokens_token_hash ON download_tokens (token_hash);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'download_tokens'
      AND column_name = 'account_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_download_tokens_account_id ON download_tokens (account_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper: read current tenant from session variable
CREATE OR REPLACE FUNCTION app_current_account_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_account_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app_store_slug() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('app.store_slug', true), '');
$$ LANGUAGE sql STABLE;

-- Enable RLS on tenant tables.
-- FORCE applies policies even to the table owner. Neon’s owner role still
-- bypasses via BYPASSRLS (neon_superuser); tenant queries SET LOCAL ROLE app_rls.
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE download_tokens FORCE ROW LEVEL SECURITY;

-- accounts: creators can read/update their own account
DROP POLICY IF EXISTS accounts_tenant_select ON accounts;
CREATE POLICY accounts_tenant_select ON accounts
  FOR SELECT
  USING (id = app_current_account_id());

DROP POLICY IF EXISTS accounts_tenant_update ON accounts;
CREATE POLICY accounts_tenant_update ON accounts
  FOR UPDATE
  USING (id = app_current_account_id());

-- users: tenant-scoped read (signup/login use service connection)
DROP POLICY IF EXISTS users_tenant_select ON users;
CREATE POLICY users_tenant_select ON users
  FOR SELECT
  USING (account_id = app_current_account_id());

-- products: tenant isolation + public read for published products on storefront
DROP POLICY IF EXISTS products_tenant_all ON products;
CREATE POLICY products_tenant_all ON products
  FOR ALL
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

DROP POLICY IF EXISTS products_public_read ON products;
CREATE POLICY products_public_read ON products
  FOR SELECT
  USING (
    status = 'published'
    AND account_id IN (
      SELECT id FROM accounts WHERE slug = app_store_slug()
    )
  );

-- orders: tenant isolation only
DROP POLICY IF EXISTS orders_tenant_all ON orders;
CREATE POLICY orders_tenant_all ON orders
  FOR ALL
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

-- download_tokens: tenant isolation via account_id
DROP POLICY IF EXISTS download_tokens_tenant_select ON download_tokens;
DROP POLICY IF EXISTS download_tokens_tenant_all ON download_tokens;
CREATE POLICY download_tokens_tenant_all ON download_tokens
  FOR ALL
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

-- Public accounts read by slug (for storefront header)
DROP POLICY IF EXISTS accounts_public_read ON accounts;
CREATE POLICY accounts_public_read ON accounts
  FOR SELECT
  USING (slug = app_store_slug());

-- Non-owner role used for all tenant-scoped queries (see src/db/rls-context.ts).
-- neon_superuser / table owner bypasses RLS; this role does not.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_rls') THEN
    CREATE ROLE app_rls NOLOGIN NOINHERIT;
  END IF;
END
$$;

GRANT app_rls TO CURRENT_USER;

GRANT USAGE ON SCHEMA public TO app_rls;
GRANT SELECT, UPDATE ON TABLE accounts TO app_rls;
GRANT SELECT ON TABLE users TO app_rls;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products TO app_rls;
GRANT SELECT ON TABLE orders TO app_rls;
GRANT SELECT ON TABLE download_tokens TO app_rls;

GRANT USAGE ON TYPE product_status TO app_rls;
GRANT USAGE ON TYPE payment_status TO app_rls;
