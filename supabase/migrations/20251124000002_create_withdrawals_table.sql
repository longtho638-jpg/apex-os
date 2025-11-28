-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Optional, if user-initiated
    admin_id UUID REFERENCES admin_users(id), -- If admin-initiated
    amount DECIMAL(20, 8) NOT NULL,
    currency TEXT DEFAULT 'USDT' NOT NULL,
    destination_address TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED', 'REQUIRES_APPROVAL')),
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_admin_id ON withdrawals(admin_id);

-- RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all withdrawals" ON withdrawals
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can create withdrawals" ON withdrawals
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update withdrawals" ON withdrawals
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
