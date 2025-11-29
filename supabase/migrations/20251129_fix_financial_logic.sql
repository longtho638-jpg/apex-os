-- Fix Financial Logic Vulnerability: Prevent negative withdrawals
-- Overwrite the function to include positive amount check

CREATE OR REPLACE FUNCTION reserve_balance_for_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL,
  p_withdrawal_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
  -- CRITICAL FIX: Prevent negative or zero amount
  IF p_amount <= 0 THEN
    RETURN FALSE;
  END IF;

  SELECT balance_usd INTO v_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE; -- Lock row
  
  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_wallets
  SET balance_usd = balance_usd - p_amount,
      reserved_balance = reserved_balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: Ensure credit amount is positive
CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
  p_user_id UUID,
  p_amount DECIMAL,
  p_source VARCHAR,
  p_metadata JSONB
) RETURNS VOID AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Credit amount must be positive';
  END IF;

  -- Upsert wallet (create if not exists)
  INSERT INTO user_wallets (user_id, balance_usd, total_earned, last_commission_at, updated_at)
  VALUES (p_user_id, p_amount, p_amount, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET balance_usd = user_wallets.balance_usd + p_amount,
      total_earned = user_wallets.total_earned + p_amount,
      last_commission_at = NOW(),
      updated_at = NOW();
  
  -- Create commission event
  INSERT INTO commission_events (user_id, amount, source, metadata)
  VALUES (p_user_id, p_amount, p_source, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix: Ensure release amount is positive
CREATE OR REPLACE FUNCTION release_reserved_balance(
  p_user_id UUID,
  p_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Release amount must be positive';
  END IF;

  UPDATE user_wallets
  SET balance_usd = balance_usd + p_amount,
      reserved_balance = reserved_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
