-- Market Data Schema

CREATE TABLE IF NOT EXISTS market_data_ohlcv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    interval VARCHAR(5) NOT NULL, -- 1m, 5m, 1h, etc.
    open_time TIMESTAMPTZ NOT NULL,
    open DECIMAL(20, 8) NOT NULL,
    high DECIMAL(20, 8) NOT NULL,
    low DECIMAL(20, 8) NOT NULL,
    close DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    close_time TIMESTAMPTZ NOT NULL,
    quote_volume DECIMAL(20, 8),
    trades INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(symbol, interval, open_time)
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol_time ON market_data_ohlcv(symbol, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_interval ON market_data_ohlcv(symbol, interval);

-- Materialized view for latest prices (fast queries)
-- Note: Materialized views require Supabase/Postgres
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_prices AS
SELECT DISTINCT ON (symbol, interval)
  symbol,
  interval,
  close as price,
  volume,
  open_time
FROM market_data_ohlcv
ORDER BY symbol, interval, open_time DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_prices ON latest_prices(symbol, interval);

-- Function to refresh view
CREATE OR REPLACE FUNCTION refresh_latest_prices()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_prices;
END;
$$ LANGUAGE plpgsql;


-- Trading Signals Table
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL, -- BUY, SELL
    confidence DECIMAL(5, 4) DEFAULT 0, -- 0.0 to 1.0
    source VARCHAR(50) NOT NULL, -- 'ML_MODEL_V1', 'RSI_STRATEGY'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON trading_signals(timestamp DESC);

-- Opportunities Table (Arbitrage, etc.)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'ARBITRAGE', 'LIQUIDATION'
    asset VARCHAR(20) NOT NULL,
    potential_profit DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'DETECTED', -- DETECTED, EXECUTED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);