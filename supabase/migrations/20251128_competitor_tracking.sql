-- supabase/migrations/20251128_competitor_tracking.sql
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  pricing JSONB,
  features JSONB,
  snapshot_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date DESC);
