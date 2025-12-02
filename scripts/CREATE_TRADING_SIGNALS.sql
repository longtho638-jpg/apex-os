-- Script tạo bảng Trading Signals
-- Copy toàn bộ nội dung bên dưới và chạy trong Supabase SQL Editor

CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    prediction VARCHAR(10) NOT NULL, -- BUY, SELL, HOLD
    confidence DECIMAL(5, 4) NOT NULL, -- 0.0 to 1.0
    entry_price DECIMAL(20, 8),
    
    -- Explainability (AI giải thích lý do)
    price_contrib DECIMAL(5, 4),
    sentiment_contrib DECIMAL(5, 4),
    volume_contrib DECIMAL(5, 4),
    
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- active, executed, expired
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo chỉ mục để query nhanh
CREATE INDEX IF NOT EXISTS idx_trading_signals_latest ON trading_signals(symbol, timestamp DESC);

-- Bật bảo mật RLS
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả user (kể cả chưa login) đọc tín hiệu (Marketing)
DROP POLICY IF EXISTS "Public read signals" ON trading_signals;
CREATE POLICY "Public read signals"
  ON trading_signals FOR SELECT
  TO authenticated, anon
  USING (true);

-- Thêm dữ liệu mẫu (Seed Data) để Dashboard không bị trống
INSERT INTO trading_signals (symbol, prediction, confidence, entry_price, price_contrib, sentiment_contrib, volume_contrib)
VALUES 
('BTC/USDT', 'BUY', 0.87, 98500.00, 0.60, 0.20, 0.07),
('ETH/USDT', 'SELL', 0.75, 2750.00, 0.50, 0.20, 0.05),
('SOL/USDT', 'BUY', 0.92, 145.50, 0.70, 0.15, 0.07),
('BNB/USDT', 'HOLD', 0.55, 620.00, 0.30, 0.15, 0.10),
('DOGE/USDT', 'BUY', 0.65, 0.12, 0.40, 0.20, 0.05);
