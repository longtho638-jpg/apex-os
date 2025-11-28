-- Create agent_heartbeats table
CREATE TABLE IF NOT EXISTS agent_heartbeats (
    agent_id VARCHAR(50) PRIMARY KEY, -- 'guardian', 'auditor'
    status VARCHAR(20) NOT NULL, -- 'RUNNING', 'STOPPED', 'ERROR'
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE agent_heartbeats IS 'Tracks the health and status of background agents';

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
