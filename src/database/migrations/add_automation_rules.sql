-- Phase 4.2: Add Stop Loss / Take Profit Support
-- Created: 2025-11-24
-- Purpose: Automation rules for automatic position management

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position_id UUID REFERENCES positions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('STOP_LOSS', 'TAKE_PROFIT', 'TRAILING_STOP')),
    trigger_price DECIMAL(20, 8) NOT NULL CHECK (trigger_price > 0),
    trailing_percent DECIMAL(5, 2), -- Only for TRAILING_STOP
    highest_price DECIMAL(20, 8), -- Track highest price for trailing stop
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRIGGERED', 'CANCELLED')),
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_rules_position ON automation_rules(position_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_rules_user ON automation_rules(user_id, status);
CREATE INDEX IF NOT EXISTS idx_automation_rules_status ON automation_rules(status);

-- Update trigger
CREATE OR REPLACE FUNCTION update_automation_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_rules_updated_at();

-- Comments
COMMENT ON TABLE automation_rules IS 'Automation rules for stop loss, take profit, and trailing stops';
COMMENT ON COLUMN automation_rules.rule_type IS 'STOP_LOSS = Close at loss limit, TAKE_PROFIT = Close at profit target, TRAILING_STOP = Follow price with trailing stop';
COMMENT ON COLUMN automation_rules.trailing_percent IS 'Percentage below highest price for trailing stop (e.g., 5.0 = 5%)';

-- Notify schema reload
NOTIFY pgrst, 'reload schema';
