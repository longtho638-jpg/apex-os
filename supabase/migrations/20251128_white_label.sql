CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'fund-a', 'exchange-b'
  custom_domain TEXT UNIQUE,
  theme_config JSONB DEFAULT '{"primaryColor": "#10b981", "logoUrl": "/logo.png"}'::jsonb,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users to tenants
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON auth.users(tenant_id);

-- RLS for Multi-Tenancy
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Users can read their own tenant info
CREATE POLICY tenant_read_policy ON tenants
  FOR SELECT USING (id = (select tenant_id from auth.users where id = auth.uid()));

-- Only Super Admin can create tenants
-- (Assuming super_admin logic exists or manual insert for now)
