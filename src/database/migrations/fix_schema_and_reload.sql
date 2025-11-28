-- 1. Force Schema Cache Reload
NOTIFY pgrst, 'reload config';

-- 2. Ensure all columns exist in 'orders' table
DO $$
BEGIN
    -- exchange_order_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'exchange_order_id') THEN
        ALTER TABLE orders ADD COLUMN exchange_order_id VARCHAR(100);
    END IF;

    -- position_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'position_id') THEN
        ALTER TABLE orders ADD COLUMN position_id UUID REFERENCES positions(id);
    END IF;

    -- filled_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'filled_at') THEN
        ALTER TABLE orders ADD COLUMN filled_at TIMESTAMPTZ;
    END IF;

    -- filled_quantity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'filled_quantity') THEN
        ALTER TABLE orders ADD COLUMN filled_quantity DECIMAL(20, 8) DEFAULT 0;
    END IF;
END $$;
