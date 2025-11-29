CREATE TABLE IF NOT EXISTS enterprise_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id), -- The B2B Client
  key_hash TEXT NOT NULL, -- Store SHA-256 hash, never plain text
  key_prefix TEXT NOT NULL, -- "apx_live_..."
  name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{read_signals}', 
  rate_limit INTEGER DEFAULT 1000, -- Requests per minute
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enterprise_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES enterprise_api_keys(id),
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_usage_key ON enterprise_usage(api_key_id);
