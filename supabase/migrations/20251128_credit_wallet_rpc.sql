CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
  p_user_id UUID,
  p_amount NUMERIC,
  p_source TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  -- Upsert wallet
  INSERT INTO wallets (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    balance = wallets.balance + p_amount,
    updated_at = NOW();
    
  -- Optionally log to a transaction history ledger here if needed
END;
$$ LANGUAGE plpgsql;
