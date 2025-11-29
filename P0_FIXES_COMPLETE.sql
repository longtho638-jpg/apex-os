-- ============================================
-- P0 PRODUCTION FIXES - COMPLETE SQL MIGRATION
-- Apply this in Supabase Dashboard SQL Editor
-- ============================================

-- Step 1: Create paper trading tables (if not exist)
CREATE TABLE IF NOT EXISTS paper_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance_usdt DECIMAL(20, 2) DEFAULT 100000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS paper_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL,
    type VARCHAR(10) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'FILLED',
    pnl DECIMAL(20, 8) DEFAULT 0,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_entry_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8),
    unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_id, symbol)
);

-- Step 2: Create atomic paper trading function
CREATE OR REPLACE FUNCTION execute_paper_trade(
    p_user_id UUID,
    p_symbol TEXT,
    p_side TEXT,
    p_quantity NUMERIC,
    p_price NUMERIC
) RETURNS JSONB AS $$
DECLARE
    v_wallet paper_wallets%ROWTYPE;
    v_position paper_positions%ROWTYPE;
    v_cost NUMERIC;
    v_revenue NUMERIC;
    v_realized_pnl NUMERIC;
    v_new_qty NUMERIC;
    v_total_cost NUMERIC;
    v_new_avg NUMERIC;
    v_trade_id UUID;
BEGIN
    SELECT * INTO v_wallet 
    FROM paper_wallets 
    WHERE user_id = p_user_id 
    FOR UPDATE;
    
    IF v_wallet IS NULL THEN
        INSERT INTO paper_wallets (user_id, balance_usdt)
        VALUES (p_user_id, 100000)
        RETURNING * INTO v_wallet;
    END IF;
    
    v_cost := p_quantity * p_price;
    
    IF p_side = 'BUY' THEN
        IF v_wallet.balance_usdt < v_cost THEN
            RAISE EXCEPTION 'Insufficient paper balance: % < %', 
                v_wallet.balance_usdt, v_cost;
        END IF;
        
        UPDATE paper_wallets 
        SET balance_usdt = balance_usdt - v_cost,
            updated_at = NOW()
        WHERE id = v_wallet.id;
        
        SELECT * INTO v_position
        FROM paper_positions
        WHERE wallet_id = v_wallet.id AND symbol = p_symbol
        FOR UPDATE;
        
        IF v_position IS NOT NULL THEN
            v_new_qty := v_position.quantity + p_quantity;
            v_total_cost := (v_position.quantity * v_position.average_entry_price) + v_cost;
            v_new_avg := v_total_cost / v_new_qty;
            
            UPDATE paper_positions
            SET quantity = v_new_qty,
                average_entry_price = v_new_avg,
                updated_at = NOW()
            WHERE id = v_position.id;
        ELSE
            INSERT INTO paper_positions (wallet_id, symbol, quantity, average_entry_price)
            VALUES (v_wallet.id, p_symbol, p_quantity, p_price);
        END IF;
        
        INSERT INTO paper_trades (wallet_id, symbol, side, type, quantity, price, status)
        VALUES (v_wallet.id, p_symbol, p_side, 'MARKET', p_quantity, p_price, 'FILLED')
        RETURNING id INTO v_trade_id;
        
        RETURN jsonb_build_object(
            'status', 'FILLED',
            'trade_id', v_trade_id,
            'side', 'BUY',
            'quantity', p_quantity,
            'price', p_price
        );
    ELSE
        SELECT * INTO v_position
        FROM paper_positions
        WHERE wallet_id = v_wallet.id AND symbol = p_symbol
        FOR UPDATE;
        
        IF v_position IS NULL OR v_position.quantity < p_quantity THEN
            RAISE EXCEPTION 'Insufficient position: % < %', 
                COALESCE(v_position.quantity, 0), p_quantity;
        END IF;
        
        v_revenue := p_quantity * p_price;
        v_realized_pnl := v_revenue - (p_quantity * v_position.average_entry_price);
        
        UPDATE paper_wallets 
        SET balance_usdt = balance_usdt + v_revenue,
            updated_at = NOW()
        WHERE id = v_wallet.id;
        
        IF v_position.quantity = p_quantity THEN
            DELETE FROM paper_positions WHERE id = v_position.id;
        ELSE
            UPDATE paper_positions
            SET quantity = quantity - p_quantity,
                updated_at = NOW()
            WHERE id = v_position.id;
        END IF;
        
        INSERT INTO paper_trades (wallet_id, symbol, side, type, quantity, price, pnl, status)
        VALUES (v_wallet.id, p_symbol, p_side, 'MARKET', p_quantity, p_price, v_realized_pnl, 'FILLED')
        RETURNING id INTO v_trade_id;
        
        RETURN jsonb_build_object(
            'status', 'FILLED',
            'trade_id', v_trade_id,
            'side', 'SELL',
            'quantity', p_quantity,
            'price', p_price,
            'pnl', v_realized_pnl
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION execute_paper_trade TO authenticated;

-- Step 3: Create atomic rate limit function
CREATE OR REPLACE FUNCTION increment_rate_limit(
    p_identifier TEXT,
    p_window_start BIGINT,
    p_window_seconds INTEGER DEFAULT 60
) RETURNS TABLE(count INTEGER, is_blocked BOOLEAN) AS $$
DECLARE
    v_count INTEGER;
    v_max_requests INTEGER := 100;
    v_key TEXT;
BEGIN
    v_key := p_identifier || ':' || p_window_start::TEXT;
    
    INSERT INTO rate_limits (key, count, window_start, updated_at)
    VALUES (v_key, 1, p_window_start, NOW())
    ON CONFLICT (key)
    DO UPDATE SET 
        count = rate_limits.count + 1,
        updated_at = NOW()
    RETURNING rate_limits.count INTO v_count;
    
    RETURN QUERY SELECT 
        v_count,
        v_count > v_max_requests AS is_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION increment_rate_limit TO authenticated;

CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
    v_expiry_threshold BIGINT;
BEGIN
    v_expiry_threshold := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 - 3600000;
    DELETE FROM rate_limits WHERE window_start < v_expiry_threshold;
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'P0 Fixes Applied Successfully!' as status;
SELECT 'Tables created: paper_wallets, paper_trades, paper_positions' as info;
SELECT 'Functions created: execute_paper_trade, increment_rate_limit, cleanup_expired_rate_limits' as info;
