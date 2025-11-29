-- Business Agility: System Configs Table
-- Allows Admin to change business rules without deployment

CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can read/write
CREATE POLICY "Admins can manage system configs" ON system_configs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_users WHERE id = auth.uid()
        )
    );

-- 2. Authenticated users can read specific public configs (if needed)
-- For now, we keep it strict. Backend API will read with Service Role if needed for calculations,
-- or we allow public read for 'public_' prefixed keys.
CREATE POLICY "Public read for public configs" ON system_configs
    FOR SELECT
    USING (key LIKE 'public_%');

-- Insert Default Values (Migrated from Hardcoded TS files)
INSERT INTO system_configs (key, value, description) VALUES
('PARTNER_COMMISSION_SHARE', '0.4'::jsonb, 'Percentage of revenue shared with partners (0.4 = 40%)'),
('TIER_CONFIGS', '{
    "vip1": {"price": 29, "features": ["basic_signals"]},
    "vip2": {"price": 97, "features": ["auto_trading"]},
    "vip3": {"price": 297, "features": ["exclusive_access"]}
}'::jsonb, 'Pricing tiers and features configuration'),
('WITHDRAWAL_LIMITS', '{"daily": 10000, "monthly": 50000}'::jsonb, 'Withdrawal limits in USD');
