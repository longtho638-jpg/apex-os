CREATE TABLE IF NOT EXISTS usage_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  charge_type TEXT NOT NULL, -- 'signal_used', 'alert_triggered', etc.
  amount NUMERIC NOT NULL,
  signal_id TEXT,
  charged_at TIMESTAMPTZ NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_charges_user ON usage_charges(user_id);
CREATE INDEX idx_usage_charges_paid ON usage_charges(paid);
