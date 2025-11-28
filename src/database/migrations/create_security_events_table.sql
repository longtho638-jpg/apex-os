-- ==============================================================================
-- MIGRATION: Create Security Events Table
-- ==============================================================================
-- Created: 2025-11-23
-- Purpose: Log security events (IP blocks, unauthorized access attempts, etc.)
-- ==============================================================================

-- Create security_events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'IP_BLOCKED',
        'NEW_IP_DETECTED', 
        'IP_WHITELIST_CHANGED',
        'UNAUTHORIZED_ACCESS',
        'MFA_FAILED'
    )),
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_security_events_admin 
ON security_events(admin_id);

CREATE INDEX IF NOT EXISTS idx_security_events_timestamp 
ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_type 
ON security_events(event_type);

CREATE INDEX IF NOT EXISTS idx_security_events_ip 
ON security_events(ip_address);

-- Add comments
COMMENT ON TABLE security_events IS 'Logs all security-related events for audit trail';
COMMENT ON COLUMN security_events.event_type IS 'Type of security event';
COMMENT ON COLUMN security_events.metadata IS 'Additional event data in JSON format';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'security_events table created successfully';
END $$;
