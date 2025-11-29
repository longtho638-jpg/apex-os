CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Seed
INSERT INTO system_config (key, value) VALUES
('maintenance_mode', '"false"'),
('trading_fee_rate', '0.001'), -- 0.1%
('withdrawal_enabled', '"true"')
ON CONFLICT (key) DO NOTHING;
