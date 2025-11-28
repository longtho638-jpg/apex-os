-- =====================================================
-- PORTFOLIO ANALYTICS SCHEMA
-- Date: 2025-11-26
-- Purpose: Efficient PnL calculation and daily snapshots
-- =====================================================

-- 1. Daily Portfolio Snapshot Table
-- Populated by a cron job (pg_cron) or scheduled worker every midnight
CREATE TABLE IF NOT EXISTS daily_portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    total_balance_usd NUMERIC NOT NULL,
    daily_pnl_usd NUMERIC,
    cumulative_pnl_usd NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_date 
ON daily_portfolio_snapshots(user_id, date);

-- 3. RLS
ALTER TABLE daily_portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own snapshots"
ON daily_portfolio_snapshots FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Function to Calculate Real-time PnL (Approximate)
-- This calculates realized PnL from trades for a given period
CREATE OR REPLACE FUNCTION get_user_pnl(p_user_id UUID, p_start_date TIMESTAMPTZ)
RETURNS TABLE (
    total_realized_pnl NUMERIC,
    trade_count BIGINT,
    volume NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN side = 'sell' THEN (price * quantity) - fee -- Revenue - Fee
                WHEN side = 'buy' THEN -(price * quantity) - fee -- Cost - Fee
            END
        ), 0) as total_realized_pnl,
        COUNT(*) as trade_count,
        COALESCE(SUM(price * quantity), 0) as volume
    FROM trades
    WHERE user_id = p_user_id
    AND created_at >= p_start_date;
END;
$$;
