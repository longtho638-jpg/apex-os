-- Create Positions Table for Perpetual/Futures Tracking
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL, -- e.g. BTCUSDT
    side VARCHAR(10) NOT NULL CHECK (side IN ('LONG', 'SHORT')),
    entry_price NUMERIC NOT NULL,
    current_price NUMERIC NOT NULL, -- Snapshot for PnL calculation
    size NUMERIC NOT NULL, -- Position size in USDT
    leverage INTEGER DEFAULT 1,
    liquidation_price NUMERIC,
    unrealized_pnl NUMERIC DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED', 'LIQUIDATED')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_positions_user_status ON positions(user_id, status);

-- RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own positions"
ON positions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE positions;
