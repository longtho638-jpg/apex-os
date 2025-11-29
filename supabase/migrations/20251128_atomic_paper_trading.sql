-- ============================================
-- Atomic Paper Trading Function
-- Prevents race conditions in paper trading
-- ============================================

CREATE OR REPLACE FUNCTION execute_paper_trade(
    p_user_id UUID,  -- Changed from TEXT to UUID to match paper_wallets.user_id
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
    v_trade_id UUID;  -- Changed from BIGINT to UUID
BEGIN
    -- Lock wallet row to prevent concurrent modifications
    SELECT * INTO v_wallet 
    FROM paper_wallets 
    WHERE user_id = p_user_id 
    FOR UPDATE;
    
    -- Create wallet if doesn't exist
    IF v_wallet IS NULL THEN
        INSERT INTO paper_wallets (user_id, balance_usdt)
        VALUES (p_user_id, 100000)
        RETURNING * INTO v_wallet;
    END IF;
    
    v_cost := p_quantity * p_price;
    
    -- ============================================
    -- BUY Logic
    -- ============================================
    IF p_side = 'BUY' THEN
        -- Check balance INSIDE transaction
        IF v_wallet.balance_usdt < v_cost THEN
            RAISE EXCEPTION 'Insufficient paper balance: % < %', 
                v_wallet.balance_usdt, v_cost;
        END IF;
        
        -- Deduct balance
        UPDATE paper_wallets 
        SET balance_usdt = balance_usdt - v_cost,
            updated_at = NOW()
        WHERE id = v_wallet.id;
        
        -- Lock position if exists
        SELECT * INTO v_position
        FROM paper_positions
        WHERE wallet_id = v_wallet.id 
          AND symbol = p_symbol
        FOR UPDATE;
        
        IF v_position IS NOT NULL THEN
            -- Update existing position
            v_new_qty := v_position.quantity + p_quantity;
            v_total_cost := (v_position.quantity * v_position.average_entry_price) + v_cost;
            v_new_avg := v_total_cost / v_new_qty;
            
            UPDATE paper_positions
            SET quantity = v_new_qty,
                average_entry_price = v_new_avg,
                updated_at = NOW()
            WHERE id = v_position.id;
        ELSE
            -- Create new position
            INSERT INTO paper_positions (wallet_id, symbol, quantity, average_entry_price)
            VALUES (v_wallet.id, p_symbol, p_quantity, p_price);
        END IF;
        
        -- Record trade
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
    
    -- ============================================
    -- SELL Logic
    -- ============================================
    ELSE
        -- Lock position
        SELECT * INTO v_position
        FROM paper_positions
        WHERE wallet_id = v_wallet.id 
          AND symbol = p_symbol
        FOR UPDATE;
        
        -- Check position exists and sufficient
        IF v_position IS NULL OR v_position.quantity < p_quantity THEN
            RAISE EXCEPTION 'Insufficient position: % < %', 
                COALESCE(v_position.quantity, 0), p_quantity;
        END IF;
        
        -- Calculate PnL
        v_revenue := p_quantity * p_price;
        v_realized_pnl := v_revenue - (p_quantity * v_position.average_entry_price);
        
        -- Add revenue to balance
        UPDATE paper_wallets 
        SET balance_usdt = balance_usdt + v_revenue,
            updated_at = NOW()
        WHERE id = v_wallet.id;
        
        -- Update or delete position
        IF v_position.quantity = p_quantity THEN
            DELETE FROM paper_positions WHERE id = v_position.id;
        ELSE
            UPDATE paper_positions
            SET quantity = quantity - p_quantity,
                updated_at = NOW()
            WHERE id = v_position.id;
        END IF;
        
        -- Record trade with PnL
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

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION execute_paper_trade TO authenticated;

-- Add comment
COMMENT ON FUNCTION execute_paper_trade IS 
'Atomically execute paper trade with balance/position checks inside transaction';
