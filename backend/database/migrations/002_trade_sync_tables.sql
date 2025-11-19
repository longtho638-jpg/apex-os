-- =====================================================
-- APEX OS - Background Trade Sync System
-- Schema Migration: trade_history + sync_jobs
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: trade_history
-- Purpose: Store all trade history from exchanges
-- =====================================================
CREATE TABLE IF NOT EXISTS trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Exchange information
    exchange TEXT NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx')),
    symbol TEXT NOT NULL,              -- 'BTC/USDT', 'ETH/USDT', etc.
    trade_id TEXT NOT NULL,            -- Exchange's unique trade ID
    
    -- Trade details
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    price DECIMAL(20, 8) NOT NULL CHECK (price > 0),
    quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
    quote_quantity DECIMAL(20, 8),    -- Total in quote currency (price * quantity)
    
    -- Fee information
    fee DECIMAL(20, 8) DEFAULT 0,
    fee_currency TEXT,
    
    -- Timestamps
    timestamp TIMESTAMPTZ NOT NULL,    -- Trade execution time from exchange
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate trades
    UNIQUE(user_id, exchange, trade_id)
);

-- Add comment
COMMENT ON TABLE trade_history IS 'Historical trades synced from exchanges for analysis';

-- =====================================================
-- Table: sync_jobs
-- Purpose: Track background sync job status
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Sync configuration
    exchange TEXT NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'success', 'failed')),
    
    -- Sync metrics
    trades_synced INTEGER DEFAULT 0,
    last_trade_timestamp TIMESTAMPTZ,  -- Timestamp of most recent trade synced
    
    -- Job tracking
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE sync_jobs IS 'Background synchronization job tracking';

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- trade_history indexes
CREATE INDEX IF NOT EXISTS idx_trade_user_time 
    ON trade_history(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_trade_symbol 
    ON trade_history(user_id, symbol, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_trade_exchange 
    ON trade_history(user_id, exchange);

CREATE INDEX IF NOT EXISTS idx_trade_side 
    ON trade_history(user_id, side);

CREATE INDEX IF NOT EXISTS idx_trade_timestamp 
    ON trade_history(timestamp DESC);

-- sync_jobs indexes
CREATE INDEX IF NOT EXISTS idx_sync_user_status 
    ON sync_jobs(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sync_exchange 
    ON sync_jobs(exchange, status);

-- =====================================================
-- Functions
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_trade_history_updated_at 
    BEFORE UPDATE ON trade_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_jobs_updated_at 
    BEFORE UPDATE ON sync_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE trade_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own trades
CREATE POLICY trade_history_user_isolation 
    ON trade_history
    FOR ALL
    USING (auth.uid() = user_id);

-- Users can only see their own sync jobs
CREATE POLICY sync_jobs_user_isolation 
    ON sync_jobs
    FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Sample Queries for Testing
-- =====================================================

-- Get recent trades for a user
-- SELECT * FROM trade_history 
-- WHERE user_id = 'user-uuid' 
-- ORDER BY timestamp DESC 
-- LIMIT 100;

-- Get sync job status
-- SELECT * FROM sync_jobs 
-- WHERE user_id = 'user-uuid' 
-- ORDER BY created_at DESC 
-- LIMIT 10;

-- Calculate win rate for a symbol
-- WITH trade_pairs AS (
--   SELECT 
--     symbol,
--     side,
--     price,
--     quantity,
--     timestamp,
--     LAG(price) OVER (PARTITION BY symbol ORDER BY timestamp) as prev_price
--   FROM trade_history
--   WHERE user_id = 'user-uuid' AND side = 'sell'
-- )
-- SELECT 
--   symbol,
--   COUNT(*) as total_sells,
--   SUM(CASE WHEN price > prev_price THEN 1 ELSE 0 END) as wins
-- FROM trade_pairs
-- WHERE prev_price IS NOT NULL
-- GROUP BY symbol;
