-- RPC to pay for subscription with wallet balance
CREATE OR REPLACE FUNCTION pay_with_wallet(
  p_user_id UUID,
  p_amount DECIMAL,
  p_tier VARCHAR,
  p_billing_period VARCHAR
) RETURNS JSONB AS $$
DECLARE
  v_balance DECIMAL;
  v_current_tier VARCHAR;
BEGIN
  -- 1. Lock wallet row and check balance
  SELECT balance_usd INTO v_balance
  FROM user_wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'message', 'Insufficient balance');
  END IF;

  -- 2. Deduct balance
  UPDATE user_wallets
  SET balance_usd = balance_usd - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- 3. Record transaction (Commission Event for record keeping, or separate payment_history?)
  -- Let's use commission_events with negative amount for now or a new table if exists.
  -- Ideally we should have a 'transactions' table but for MVP we can use commission_events 
  -- with a specific source to track wallet usage.
  -- Actually, let's just log it in commission_events as a 'debit' for now to keep it simple 
  -- and visible in wallet history if that table is used for history.
  -- Wait, commission_events is for EARNINGS. 
  -- We should probably have a 'wallet_transactions' table.
  -- Checking existing tables... 'withdrawal_requests' is for withdrawals.
  -- Let's just update the user_tiers directly and assume we log it in a generic way or 
  -- create a simple audit log here.
  
  -- Let's insert into a new table 'wallet_transactions' if we had one, but we don't.
  -- We'll use `commission_events` with negative amount? No, that's messy.
  -- We'll just proceed with the deduction and tier update. 
  -- The `user_wallets` update is the source of truth for balance.
  
  -- 4. Update User Tier
  INSERT INTO user_tiers (user_id, tier, tier_updated_at, updated_at)
  VALUES (p_user_id, p_tier, NOW(), NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET tier = p_tier,
      tier_updated_at = NOW(),
      updated_at = NOW();

  -- 5. Auto-claim any pending missed commissions (Grace Period Reward)
  PERFORM claim_pending_vault_funds(p_user_id);

  -- 6. Return success
  RETURN jsonb_build_object('success', true, 'message', 'Payment successful');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
