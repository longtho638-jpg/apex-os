-- =====================================================
-- API KEYS for INSTITUTIONAL TRADERS
-- Date: 2025-11-26
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label VARCHAR(50),
    access_key VARCHAR(64) NOT NULL UNIQUE, -- Public Key
    secret_key VARCHAR(255) NOT NULL, -- Private Key (In prod, encrypt this!)
    permissions JSONB DEFAULT '["read", "trade"]',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_api_keys_access ON api_keys(access_key);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies (already defined in audit-rls.sql but good to reaffirm)
-- Users manage own keys
CREATE POLICY "Users manage own keys"
ON api_keys FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role manages all
CREATE POLICY "Service role manages keys"
ON api_keys FOR ALL
TO service_role
USING (true) WITH CHECK (true);
