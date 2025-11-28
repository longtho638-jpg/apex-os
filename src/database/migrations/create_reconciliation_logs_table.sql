-- Create daily_reconciliation_logs table
CREATE TABLE IF NOT EXISTS daily_reconciliation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_system_balance DECIMAL(30, 8) NOT NULL,
    total_transaction_sum DECIMAL(30, 8) NOT NULL,
    discrepancy DECIMAL(30, 8) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'MATCH', 'MISMATCH'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reconciliation_date ON daily_reconciliation_logs(date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_status ON daily_reconciliation_logs(status);

-- Comments
COMMENT ON TABLE daily_reconciliation_logs IS 'Daily financial integrity check results';
