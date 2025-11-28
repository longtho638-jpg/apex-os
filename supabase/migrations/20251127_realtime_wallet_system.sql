-- 1. User wallet balances
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  balance_usd DECIMAL(10, 2) DEFAULT 0,
  reserved_balance DECIMAL(10, 2) DEFAULT 0, -- For pending withdrawals
  total_earned DECIMAL(15, 2) DEFAULT 0,
  total_withdrawn DECIMAL(15, 2) DEFAULT 0,
  last_commission_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Commission transactions (realtime)
CREATE TABLE IF NOT EXISTS commission_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'trading_rebate', 'l1_commission', 'l2_commission', etc.
  from_user_id UUID REFERENCES auth.users(id), -- If commission from referral
  trade_id UUID, -- Reference to original trade
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Withdrawal requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  crypto_address VARCHAR(100) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USDT',
  network VARCHAR(20) DEFAULT 'TRC20',
  
  status VARCHAR(30) DEFAULT 'pending',
  -- Status flow: pending → agent_approved → approved → executing → completed
  
  risk_score INTEGER,
  agent_notes TEXT,
  agent_approved_at TIMESTAMPTZ,
  
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  tx_hash VARCHAR(100),
  tx_fee DECIMAL(10, 6),
  payout_provider VARCHAR(50), -- 'nowpayments', 'smart_contract'
  executed_at TIMESTAMPTZ,
  
  data_checksum VARCHAR(64) NOT NULL, -- CRITICAL for fraud prevention
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Immutable audit log
CREATE TABLE IF NOT EXISTS withdrawal_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_id UUID REFERENCES withdrawal_requests(id),
  event_type VARCHAR(50) NOT NULL,
  actor VARCHAR(100) NOT NULL, -- 'user:uuid', 'agent:auto', 'admin:uuid', 'system:auto'
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  metadata JSONB,
  checksum VARCHAR(64), -- Hash linking to previous log entry
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_events_user_id ON commission_events(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_audit_log_withdrawal_id ON withdrawal_audit_log(withdrawal_id);


-- 6. Functions

-- Credit user balance (realtime)
CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
  p_user_id UUID,
  p_amount DECIMAL,
  p_source VARCHAR,
  p_metadata JSONB
) RETURNS VOID AS $$
BEGIN
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

-- Reserve balance for withdrawal
CREATE OR REPLACE FUNCTION reserve_balance_for_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL,
  p_withdrawal_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_balance DECIMAL;
BEGIN
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

-- Release reserved balance (if withdrawal fails)
CREATE OR REPLACE FUNCTION release_reserved_balance(
  p_user_id UUID,
  p_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE user_wallets
  SET balance_usd = balance_usd + p_amount,
      reserved_balance = reserved_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finalize withdrawal (success)
CREATE OR REPLACE FUNCTION finalize_withdrawal(
  p_user_id UUID,
  p_amount DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE user_wallets
  SET reserved_balance = reserved_balance - p_amount,
      total_withdrawn = total_withdrawn + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. RLS Policies

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_audit_log ENABLE ROW LEVEL SECURITY;

-- User Wallets Policies
CREATE POLICY "Users can view own wallet"
  ON user_wallets FOR SELECT
  USING (auth.uid() = user_id);

-- Commission Events Policies
CREATE POLICY "Users can view own commissions"
  ON commission_events FOR SELECT
  USING (auth.uid() = user_id);

-- Withdrawal Requests Policies
CREATE POLICY "Users can create own withdrawals"
  ON withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own withdrawals"
  ON withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);
  
-- Audit Log Policies (View only for user's own withdrawals)
CREATE POLICY "Users can view own withdrawal logs"
  ON withdrawal_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM withdrawal_requests 
      WHERE withdrawal_requests.id = withdrawal_audit_log.withdrawal_id 
      AND withdrawal_requests.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON user_wallets TO authenticated;
GRANT SELECT, INSERT ON commission_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON withdrawal_requests TO authenticated;
GRANT SELECT ON withdrawal_audit_log TO authenticated;
