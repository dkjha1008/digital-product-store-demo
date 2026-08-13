-- Enforce RLS for a non-owner role and add account_id on download_tokens.
-- Safe to re-run. Required because table owners / neon_superuser bypass RLS.

ALTER TABLE download_tokens
  ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;

UPDATE download_tokens dt
SET account_id = o.account_id
FROM orders o
WHERE dt.order_id = o.id
  AND dt.account_id IS NULL;

ALTER TABLE download_tokens
  ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_download_tokens_account_id ON download_tokens (account_id);

ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;
ALTER TABLE download_tokens FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS download_tokens_tenant_select ON download_tokens;
DROP POLICY IF EXISTS download_tokens_tenant_all ON download_tokens;
CREATE POLICY download_tokens_tenant_all ON download_tokens
  FOR ALL
  USING (account_id = app_current_account_id())
  WITH CHECK (account_id = app_current_account_id());

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
