-- =====================================================
-- ADVANCED TRADING SYSTEM SCHEMA
-- Date: 2025-11-26
-- Purpose: Support Limit, Market, Stop-Loss, OCO orders
-- =====================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL, -- e.g. BTC/USDT
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'stop_limit', 'oco')),
    
    -- Pricing & Quantity
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price NUMERIC, -- Nullable for Market orders
    stop_price NUMERIC, -- Required for Stop orders
    
    -- OCO specific
    oco_group_id UUID, -- Links two orders together
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'filled', 'partial', 'cancelled', 'rejected', 'triggered')),
    filled_quantity NUMERIC DEFAULT 0,
    average_fill_price NUMERIC DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Trades Table (Execution History)
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    fee_currency VARCHAR(10) DEFAULT 'USDT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_symbol_status ON orders(symbol, status);
CREATE INDEX IF NOT EXISTS idx_orders_open ON orders(symbol, side, price) WHERE status = 'open';

-- 4. RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Orders: Users see their own, Service Role sees all
CREATE POLICY "Users manage own orders"
ON orders FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages all orders"
ON orders FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Trades: Users view their own, Service Role manages
CREATE POLICY "Users view own trades"
ON trades FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role manages all trades"
ON trades FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
