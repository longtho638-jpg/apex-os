-- Add referral fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Create commissions table
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id) NOT NULL,
    referee_id UUID REFERENCES users(id) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    order_id UUID REFERENCES orders(id), -- Link to specific trade
    reason VARCHAR(50) DEFAULT 'TRADE_COMMISSION', -- 'TRADE_COMMISSION', 'COPY_PROFIT_SHARE'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_commissions_referrer_id ON commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at DESC);

-- Comments
COMMENT ON TABLE commissions IS 'History of affiliate earnings';
