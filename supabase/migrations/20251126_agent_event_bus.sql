-- =====================================================
-- AGENT EVENT BUS SCHEMA
-- Purpose: Centralized log and queue for Agent-to-Agent communication
-- Pattern: Transactional Outbox / Persistent Event Log
-- =====================================================

-- 1. Create Event Table
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- e.g., 'RISK_ALERT', 'TRADE_SIGNAL', 'WITHDRAWAL_REQUEST'
    source VARCHAR(50) NOT NULL, -- e.g., 'guardian_agent', 'strategy_agent'
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INT DEFAULT 0,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_agent_events_status_created 
ON agent_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_agent_events_type 
ON agent_events(type);

-- 3. RLS Policies (Agents/Service Role need full access)
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

-- Service Role (Backend Agents) gets full access
CREATE POLICY "Service role can manage events"
ON agent_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view events (Read-only dashboard)
CREATE POLICY "Admins can view events"
ON agent_events
FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- 4. Realtime functionality
-- Enable Supabase Realtime for this table so Frontend/Agents can subscribe via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE agent_events;
