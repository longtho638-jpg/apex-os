CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup (optional, but good for finding old records)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- RLS: Only service role should access this usually, but for simplicity in this MVP we allow public read/write if needed, 
-- OR better: keep it private and only access via Service Role Client in the API route.
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access (default)
-- We don't add public policies because rate limiting is a backend system function.
