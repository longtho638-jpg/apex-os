-- Fix constraints for ORDERS table
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_side_check;
ALTER TABLE orders ADD CONSTRAINT orders_side_check CHECK (side IN ('BUY', 'SELL'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_type_check;
ALTER TABLE orders ADD CONSTRAINT orders_type_check CHECK (type IN ('MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'));

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('PENDING', 'FILLED', 'CANCELLED', 'REJECTED'));

-- Fix constraints for POSITIONS table
ALTER TABLE positions DROP CONSTRAINT IF EXISTS positions_side_check;
ALTER TABLE positions ADD CONSTRAINT positions_side_check CHECK (side IN ('LONG', 'SHORT'));

ALTER TABLE positions DROP CONSTRAINT IF EXISTS positions_status_check;
ALTER TABLE positions ADD CONSTRAINT positions_status_check CHECK (status IN ('OPEN', 'CLOSED', 'LIQUIDATED'));

-- Reload schema cache
NOTIFY pgrst, 'reload config';
