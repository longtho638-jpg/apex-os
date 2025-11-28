-- Phase 5.3: Create Audit Logs System
-- Created: 2025-11-24
-- Purpose: Comprehensive audit trail for all admin actions

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Comments
COMMENT ON TABLE audit_logs IS 'Complete audit trail of all administrative actions';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., USER_CREATED, ORDER_CANCELLED)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., USER, ORDER, WALLET)';
COMMENT ON COLUMN audit_logs.old_value IS 'Previous state before change (for updates)';
COMMENT ON COLUMN audit_logs.new_value IS 'New state after change (for creates/updates)';

NOTIFY pgrst, 'reload schema';
