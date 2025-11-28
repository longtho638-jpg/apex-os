-- Whale Activity Tracking

CREATE TABLE IF NOT EXISTS whale_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    amount_usd DECIMAL(20, 2) NOT NULL,
    transaction_hash VARCHAR(100),
    direction VARCHAR(10) NOT NULL, -- 'IN', 'OUT'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(transaction_hash)
);

CREATE INDEX IF NOT EXISTS idx_whale_symbol_time ON whale_activity(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_amount ON whale_activity(amount_usd DESC);

-- RLS Policies
ALTER TABLE whale_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read whale activity"
  ON whale_activity FOR SELECT
  TO authenticated, anon
  USING (true);
