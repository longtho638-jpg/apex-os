-- Phase 4.1.1: Add Limit Order Support
-- Created: 2025-11-24
-- Purpose: Extend orders table and create order book for limit orders

-- Extend orders table with limit order fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS limit_price DECIMAL(20, 8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS time_in_force VARCHAR(10) DEFAULT 'GTC'; -- GTC (Good-Til-Cancelled), IOC (Immediate-Or-Cancel), FOK (Fill-Or-Kill)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trigger_price DECIMAL(20, 8); -- For stop-limit orders

-- Create order book table for active limit orders
CREATE TABLE IF NOT EXISTS order_book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL CHECK (side IN ('BUY', 'SELL')),
    price DECIMAL(20, 8) NOT NULL CHECK (price > 0),
    quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
    filled_quantity DECIMAL(20, 8) DEFAULT 0 CHECK (filled_quantity >= 0),
    remaining_quantity DECIMAL(20, 8) GENERATED ALWAYS AS (quantity - filled_quantity) STORED,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PARTIAL', 'FILLED', 'CANCELLED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_book_symbol_side_price ON order_book(symbol, side, price);
CREATE INDEX IF NOT EXISTS idx_order_book_user_status ON order_book(user_id, status);
CREATE INDEX IF NOT EXISTS idx_order_book_status_created ON order_book(status, created_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_book_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_book_updated_at
    BEFORE UPDATE ON order_book
    FOR EACH ROW
    EXECUTE FUNCTION update_order_book_updated_at();

-- Create view for open orders by symbol and side
CREATE OR REPLACE VIEW order_book_by_symbol AS
SELECT 
    symbol,
    side,
    price,
    SUM(remaining_quantity) as total_quantity,
    COUNT(*) as order_count
FROM order_book
WHERE status = 'OPEN'
GROUP BY symbol, side, price
ORDER BY symbol, side, price DESC;

-- Add comment for documentation
COMMENT ON TABLE order_book IS 'Active limit orders waiting to be matched against market prices';
COMMENT ON COLUMN order_book.time_in_force IS 'GTC = Good-Til-Cancelled, IOC = Immediate-Or-Cancel, FOK = Fill-Or-Kill';
COMMENT ON COLUMN order_book.trigger_price IS 'Price that triggers stop-limit orders';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
