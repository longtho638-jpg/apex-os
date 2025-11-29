-- Provider Metrics Table
-- Tracks daily performance stats for each provider

CREATE TABLE IF NOT EXISTS provider_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_volume DECIMAL(20, 8) DEFAULT 0,
    total_revenue DECIMAL(20, 8) DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider_id, date)
);

-- Indexes for performance
CREATE INDEX idx_provider_metrics_provider_date ON provider_metrics(provider_id, date);
CREATE INDEX idx_provider_metrics_date ON provider_metrics(date);

-- RLS Policies
ALTER TABLE provider_metrics ENABLE ROW LEVEL SECURITY;

-- Admins can view all metrics
CREATE POLICY "Admins can view all provider metrics"
    ON provider_metrics FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM users WHERE role IN ('super_admin', 'admin')
        )
    );

-- System can insert/update metrics (for background jobs)
-- Note: In a real scenario, we might use a service role key which bypasses RLS,
-- but explicit policies for service roles or specific users are good practice.
