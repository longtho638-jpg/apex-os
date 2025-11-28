-- Phase 4.4: ML Trading Signals
-- Created: 2025-11-24
-- Purpose: Store ML-generated trading signals

CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    signal_type VARCHAR(10) NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
    reason TEXT,
    confidence DECIMAL(3, 2) CHECK (confidence >= 0 AND confidence <= 1),
    indicators JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_signals_symbol_created ON trading_signals(symbol, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_type_confidence ON trading_signals(signal_type, confidence);

-- View for latest signals
CREATE OR REPLACE VIEW latest_trading_signals AS
SELECT DISTINCT ON (symbol)
    *
FROM trading_signals
ORDER BY symbol, created_at DESC;

COMMENT ON TABLE trading_signals IS 'ML-generated trading signals based on technical indicators';
COMMENT ON COLUMN trading_signals.confidence IS 'Signal confidence from 0.0 to 1.0';
COMMENT ON COLUMN trading_signals.indicators IS 'JSON object with RSI, MACD, and other indicator values';

NOTIFY pgrst, 'reload schema';
