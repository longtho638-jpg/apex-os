-- Multi-Sig Approval System Tables

-- System Settings (for global config like min_approvals)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- Insert default settings if not exists
INSERT INTO system_settings (key, value)
VALUES ('multisig_config', '{"min_approvals": 2, "high_risk_threshold": 10000}'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- Approval Requests (The "Thing" that needs approval)
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES admin_users(id) NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'WITHDRAWAL', 'SYSTEM_CONFIG', 'USER_BAN'
    payload JSONB NOT NULL, -- The data for the action (e.g., amount, destination)
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    executed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- Approvals (The signatures)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES admin_users(id) NOT NULL,
    approved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(request_id, admin_id) -- One admin can only approve once per request
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approvals_request_id ON approvals(request_id);

-- RLS Policies
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Admins can view all requests
CREATE POLICY "Admins can view all approval requests" ON approval_requests
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Admins can create requests
CREATE POLICY "Admins can create approval requests" ON approval_requests
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Admins can view approvals
CREATE POLICY "Admins can view approvals" ON approvals
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Admins can insert approvals (Sign off)
CREATE POLICY "Admins can approve" ON approvals
    FOR INSERT
    WITH CHECK (auth.uid() = admin_id);
