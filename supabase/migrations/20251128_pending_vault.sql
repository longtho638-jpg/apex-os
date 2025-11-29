-- Vault for missed commissions (Grace Period Protection)
CREATE TABLE IF NOT EXISTS pending_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  source TEXT NOT NULL, -- 'referral', 'rebate_cap_exceeded', 'signal_profit'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_pending_vault_user ON pending_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_vault_status ON pending_vault(status);

-- Function to move funds from Vault to Wallet (user_wallets)
CREATE OR REPLACE FUNCTION claim_pending_vault_funds(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total_claimed NUMERIC := 0;
BEGIN
  -- Calculate total valid pending amount
  -- Calculate total valid pending amount
  -- CRITICAL SECURITY FIX: Lock rows to prevent race conditions (Double Spending)
  SELECT COALESCE(SUM(amount), 0) INTO total_claimed
  FROM pending_vault
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND expires_at > NOW()
  FOR UPDATE;

  IF total_claimed > 0 THEN
    -- Update Vault records
    UPDATE pending_vault
    SET status = 'claimed', claimed_at = NOW()
    WHERE user_id = p_user_id
      AND status = 'pending'
      AND expires_at > NOW();

    -- Add to Wallet (user_wallets) - EXISTING TABLE
    INSERT INTO user_wallets (user_id, balance_usd, total_earned, updated_at)
    VALUES (p_user_id, total_claimed, total_claimed, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
      balance_usd = user_wallets.balance_usd + total_claimed,
      total_earned = user_wallets.total_earned + total_claimed,
      updated_at = NOW();
      
    -- Log commission event for history
    INSERT INTO commission_events (user_id, amount, source, metadata)
    VALUES (p_user_id, total_claimed, 'missed_commission_claim', '{"type": "grace_period_recovery"}');
  END IF;

  RETURN total_claimed;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE pending_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY pending_vault_user_policy ON pending_vault
  FOR SELECT USING (auth.uid() = user_id);

