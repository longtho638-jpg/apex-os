CREATE TABLE IF NOT EXISTS hive_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  long_ratio NUMERIC NOT NULL, -- % of bots/users Long
  short_ratio NUMERIC NOT NULL, -- % of bots/users Short
  active_participants INTEGER NOT NULL,
  confidence_score NUMERIC NOT NULL, -- Based on historical accuracy of participants
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL, -- 'database', 'price_feed', 'execution'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  latency_ms INTEGER,
  action_taken TEXT, -- 'rerouted', 'restarted', 'notified'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hive_signals_created ON hive_signals(created_at DESC);
