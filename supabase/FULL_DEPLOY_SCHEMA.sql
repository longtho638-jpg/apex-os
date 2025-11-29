-- Create table for storing WebAuthn/FIDO2 security keys
CREATE TABLE IF NOT EXISTS admin_security_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL, -- Stored as Base64 or similar
    counter BIGINT DEFAULT 0 NOT NULL,
    transports JSONB DEFAULT '[]'::JSONB, -- e.g., ["usb", "nfc", "ble"]
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    nickname TEXT -- e.g., "My YubiKey 5"
);

-- Index for fast lookups by admin_id
CREATE INDEX IF NOT EXISTS idx_admin_security_keys_admin_id ON admin_security_keys(admin_id);

-- Index for looking up by credential_id (during login)
CREATE INDEX IF NOT EXISTS idx_admin_security_keys_credential_id ON admin_security_keys(credential_id);

-- Add RLS policies
ALTER TABLE admin_security_keys ENABLE ROW LEVEL SECURITY;

-- Admins can view their own keys
CREATE POLICY "Admins can view own security keys" ON admin_security_keys
    FOR SELECT
    USING (auth.uid() = admin_id);

-- Admins can delete their own keys
CREATE POLICY "Admins can delete own security keys" ON admin_security_keys
    FOR DELETE
    USING (auth.uid() = admin_id);

-- Only service role can insert/update (via API) to ensure validation
-- (Or allow insert if admin_id matches auth.uid(), but usually registration is a specific flow)
-- Multi-Sig Approval System Tables

-- System Settings (for global config like min_approvals)
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- Insert default settings if not exists
INSERT INTO system_settings (key, value)
VALUES ('multisig_config', '{"min_approvals": 2, "high_risk_threshold": 10000}'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- Approval Requests (The "Thing" that needs approval)
CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES admin_users(id) NOT NULL,
    action_type TEXT NOT NULL, -- e.g., 'WITHDRAWAL', 'SYSTEM_CONFIG', 'USER_BAN'
    payload JSONB NOT NULL, -- The data for the action (e.g., amount, destination)
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    executed_at TIMESTAMPTZ,
    rejection_reason TEXT
);

-- Approvals (The signatures)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id UUID REFERENCES approval_requests(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES admin_users(id) NOT NULL,
    approved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(request_id, admin_id) -- One admin can only approve once per request
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approvals_request_id ON approvals(request_id);

-- RLS Policies
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Admins can view all requests
CREATE POLICY "Admins can view all approval requests" ON approval_requests
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Admins can create requests
CREATE POLICY "Admins can create approval requests" ON approval_requests
    FOR INSERT
    WITH CHECK (auth.uid() = requester_id);

-- Admins can view approvals
CREATE POLICY "Admins can view approvals" ON approvals
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Admins can insert approvals (Sign off)
CREATE POLICY "Admins can approve" ON approvals
    FOR INSERT
    WITH CHECK (auth.uid() = admin_id);
-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id), -- Optional, if user-initiated
    admin_id UUID REFERENCES admin_users(id), -- If admin-initiated
    amount DECIMAL(20, 8) NOT NULL,
    currency TEXT DEFAULT 'USDT' NOT NULL,
    destination_address TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED', 'REQUIRES_APPROVAL')),
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_admin_id ON withdrawals(admin_id);

-- RLS
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all withdrawals" ON withdrawals
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can create withdrawals" ON withdrawals
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can update withdrawals" ON withdrawals
    FOR UPDATE
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));
-- Cold Storage Wallets Table
CREATE TABLE IF NOT EXISTS cold_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL, -- e.g., "Ledger Nano X - Vault 1"
    address TEXT NOT NULL,
    chain TEXT DEFAULT 'ETH' NOT NULL, -- ETH, BTC, SOL, etc.
    balance DECIMAL(20, 8) DEFAULT 0,
    currency TEXT DEFAULT 'USDT',
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPROMISED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cold_wallets_status ON cold_wallets(status);

-- RLS
ALTER TABLE cold_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cold wallets" ON cold_wallets
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage cold wallets" ON cold_wallets
    FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Insert some mock data for visualization
INSERT INTO cold_wallets (label, address, chain, balance, currency)
VALUES 
    ('Vault Alpha (Ledger)', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'ETH', 1500000.00, 'USDT'),
    ('Vault Beta (Trezor)', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'BTC', 12.5, 'BTC'),
    ('Solana Deep Storage', '5U3bH5b6XtG99aC6tH99aC6tH99aC6tH99aC6tH99aC6', 'SOL', 45000.00, 'SOL');
-- =====================================================
-- AGENT EVENT BUS SCHEMA
-- Purpose: Centralized log and queue for Agent-to-Agent communication
-- Pattern: Transactional Outbox / Persistent Event Log
-- =====================================================

-- 1. Create Event Table
CREATE TABLE IF NOT EXISTS agent_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- e.g., 'RISK_ALERT', 'TRADE_SIGNAL', 'WITHDRAWAL_REQUEST'
    source VARCHAR(50) NOT NULL, -- e.g., 'guardian_agent', 'strategy_agent'
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    retry_count INT DEFAULT 0,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_agent_events_status_created 
ON agent_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_agent_events_type 
ON agent_events(type);

-- 3. RLS Policies (Agents/Service Role need full access)
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

-- Service Role (Backend Agents) gets full access
CREATE POLICY "Service role can manage events"
ON agent_events
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Admins can view events (Read-only dashboard)
CREATE POLICY "Admins can view events"
ON agent_events
FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
);

-- 4. Realtime functionality
-- Enable Supabase Realtime for this table so Frontend/Agents can subscribe via WebSocket
ALTER PUBLICATION supabase_realtime ADD TABLE agent_events;
-- =====================================================
-- API KEYS for INSTITUTIONAL TRADERS
-- Date: 2025-11-26
-- =====================================================

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    label VARCHAR(50),
    access_key VARCHAR(64) NOT NULL UNIQUE, -- Public Key
    secret_key VARCHAR(255) NOT NULL, -- Private Key (In prod, encrypt this!)
    permissions JSONB DEFAULT '["read", "trade"]',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_api_keys_access ON api_keys(access_key);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policies (already defined in audit-rls.sql but good to reaffirm)
-- Users manage own keys
CREATE POLICY "Users manage own keys"
ON api_keys FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Service role manages all
CREATE POLICY "Service role manages keys"
ON api_keys FOR ALL
TO service_role
USING (true) WITH CHECK (true);
-- =====================================================
-- ADVANCED TRADING SYSTEM SCHEMA
-- Date: 2025-11-26
-- Purpose: Support Limit, Market, Stop-Loss, OCO orders
-- =====================================================

-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL, -- e.g. BTC/USDT
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('market', 'limit', 'stop_loss', 'stop_limit', 'oco')),
    
    -- Pricing & Quantity
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price NUMERIC, -- Nullable for Market orders
    stop_price NUMERIC, -- Required for Stop orders
    
    -- OCO specific
    oco_group_id UUID, -- Links two orders together
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'filled', 'partial', 'cancelled', 'rejected', 'triggered')),
    filled_quantity NUMERIC DEFAULT 0,
    average_fill_price NUMERIC DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Trades Table (Execution History)
CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL,
    price NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    fee_currency VARCHAR(10) DEFAULT 'USDT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_symbol_status ON orders(symbol, status);
CREATE INDEX IF NOT EXISTS idx_orders_open ON orders(symbol, side, price) WHERE status = 'open';

-- 4. RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Orders: Users see their own, Service Role sees all
CREATE POLICY "Users manage own orders"
ON orders FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages all orders"
ON orders FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- Trades: Users view their own, Service Role manages
CREATE POLICY "Users view own trades"
ON trades FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role manages all trades"
ON trades FOR ALL
TO service_role
USING (true) WITH CHECK (true);

-- 5. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE trades;
-- Function to calculate 24h volume efficiently
-- Avoids fetching all rows to application layer
CREATE OR REPLACE FUNCTION calculate_total_volume_24h()
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_vol NUMERIC;
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_vol
  FROM transactions
  WHERE status = 'completed'
  AND created_at > (NOW() - INTERVAL '24 hours');
  
  RETURN total_vol;
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_status_created_at 
ON transactions(status, created_at);

-- CREATE INDEX IF NOT EXISTS idx_users_last_sign_in ON auth.users(last_sign_in_at); -- Skipped due to permission restrictions
-- Payment Gateways Enum
CREATE TYPE payment_gateway AS ENUM ('polar', 'nowpayments');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- Payment Transactions Table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gateway Info
  gateway payment_gateway NOT NULL,
  gateway_transaction_id TEXT NOT NULL, -- Polar checkout ID or Binance order ID
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  
  -- Product Info
  product_id TEXT, -- Polar product ID or tier name
  product_name TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT unique_gateway_transaction UNIQUE(gateway, gateway_transaction_id)
);

-- Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Subscription Info
  tier TEXT NOT NULL, -- 'FREE', 'FOUNDERS', 'PREMIUM'
  status subscription_status NOT NULL DEFAULT 'active',
  
  -- Gateway Info
  gateway payment_gateway,
  gateway_subscription_id TEXT, -- Polar subscription ID or Binance recurring order ID
  
  -- Billing
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- Partial unique index for active subscriptions (one active sub per user)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_active_subscription 
ON subscriptions(user_id) 
WHERE status = 'active';

-- RLS Policies
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all (future enhancement)
-- CREATE POLICY "Admins can view all transactions"
--   ON payment_transactions FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_gateway ON payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_transactions_updated_at 
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- =====================================================
-- PORTFOLIO ANALYTICS SCHEMA
-- Date: 2025-11-26
-- Purpose: Efficient PnL calculation and daily snapshots
-- =====================================================

-- 1. Daily Portfolio Snapshot Table
-- Populated by a cron job (pg_cron) or scheduled worker every midnight
CREATE TABLE IF NOT EXISTS daily_portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    date DATE NOT NULL,
    total_balance_usd NUMERIC NOT NULL,
    daily_pnl_usd NUMERIC,
    cumulative_pnl_usd NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_user_date 
ON daily_portfolio_snapshots(user_id, date);

-- 3. RLS
ALTER TABLE daily_portfolio_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own snapshots"
ON daily_portfolio_snapshots FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 4. Function to Calculate Real-time PnL (Approximate)
-- This calculates realized PnL from trades for a given period
CREATE OR REPLACE FUNCTION get_user_pnl(p_user_id UUID, p_start_date TIMESTAMPTZ)
RETURNS TABLE (
    total_realized_pnl NUMERIC,
    trade_count BIGINT,
    volume NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(
            CASE 
                WHEN side = 'sell' THEN (price * quantity) - fee -- Revenue - Fee
                WHEN side = 'buy' THEN -(price * quantity) - fee -- Cost - Fee
            END
        ), 0) as total_realized_pnl,
        COUNT(*) as trade_count,
        COALESCE(SUM(price * quantity), 0) as volume
    FROM trades
    WHERE user_id = p_user_id
    AND created_at >= p_start_date;
END;
$$;
-- Market Data Schema

CREATE TABLE IF NOT EXISTS market_data_ohlcv (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    interval VARCHAR(5) NOT NULL, -- 1m, 5m, 1h, etc.
    open_time TIMESTAMPTZ NOT NULL,
    open DECIMAL(20, 8) NOT NULL,
    high DECIMAL(20, 8) NOT NULL,
    low DECIMAL(20, 8) NOT NULL,
    close DECIMAL(20, 8) NOT NULL,
    volume DECIMAL(20, 8) NOT NULL,
    close_time TIMESTAMPTZ NOT NULL,
    quote_volume DECIMAL(20, 8),
    trades INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(symbol, interval, open_time)
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol_time ON market_data_ohlcv(symbol, open_time DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_interval ON market_data_ohlcv(symbol, interval);

-- Materialized view for latest prices (fast queries)
-- Note: Materialized views require Supabase/Postgres
CREATE MATERIALIZED VIEW IF NOT EXISTS latest_prices AS
SELECT DISTINCT ON (symbol, interval)
  symbol,
  interval,
  close as price,
  volume,
  open_time
FROM market_data_ohlcv
ORDER BY symbol, interval, open_time DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_latest_prices ON latest_prices(symbol, interval);

-- Function to refresh view
CREATE OR REPLACE FUNCTION refresh_latest_prices()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_prices;
END;
$$ LANGUAGE plpgsql;


-- Trading Signals Table
CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    type VARCHAR(10) NOT NULL, -- BUY, SELL
    confidence DECIMAL(5, 4) DEFAULT 0, -- 0.0 to 1.0
    source VARCHAR(50) NOT NULL, -- 'ML_MODEL_V1', 'RSI_STRATEGY'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON trading_signals(timestamp DESC);

-- Opportunities Table (Arbitrage, etc.)
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'ARBITRAGE', 'LIQUIDATION'
    asset VARCHAR(20) NOT NULL,
    potential_profit DECIMAL(20, 8),
    status VARCHAR(20) DEFAULT 'DETECTED', -- DETECTED, EXECUTED, EXPIRED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);-- Paper Trading Schema

-- Virtual Wallets
CREATE TABLE paper_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance_usdt DECIMAL(20, 2) DEFAULT 100000.00, -- Start with 100k paper money
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Paper Trades
CREATE TABLE paper_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL, -- BUY, SELL
    type VARCHAR(10) NOT NULL, -- LIMIT, MARKET
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'FILLED', -- FILLED, OPEN, CANCELLED
    pnl DECIMAL(20, 8) DEFAULT 0, -- Realized PnL
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper Positions (Active holdings)
CREATE TABLE paper_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_entry_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8), -- Updated via job
    unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_id, symbol)
);
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
-- Enable RLS on all tables
ALTER TABLE user_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 1. User Tiers Policies
-- ============================================================

-- Users can read their own tier data
CREATE POLICY "Users can view own tier"
ON user_tiers FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all tiers (Assuming a function or claim for admin exists, 
-- for now using a service_role bypass or checking a specific metadata field if needed. 
-- Standard Supabase practice is service_role bypasses RLS, but for app admins:
-- checking a specific email or role table is common. 
-- For this migration, we'll assume basic user isolation first.)

-- ============================================================
-- 2. Referral Network Policies
-- ============================================================

-- Users can see who they referred (downstream)
CREATE POLICY "Users can view their referrals"
ON referral_network FOR SELECT
USING (auth.uid() = referrer_id);

-- Users can see who referred them (upstream)
CREATE POLICY "Users can view their referrer"
ON referral_network FOR SELECT
USING (auth.uid() = referee_id);

-- ============================================================
-- 3. Commission Pool Policies
-- ============================================================

-- All authenticated users can view the pool stats (transparency)
CREATE POLICY "Authenticated users view pool"
ON commission_pool FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- 4. Commission Transactions Policies
-- ============================================================

-- Users can view their own commission history
CREATE POLICY "Users view own commissions"
ON commission_transactions FOR SELECT
USING (auth.uid() = user_id);

-- ============================================================
-- 5. Viral Metrics Policies
-- ============================================================

-- Only specific admins should see this. 
-- If we don't have an admin role setup yet, we might restrict to none (service role only)
-- or allow all authenticated for now (if it's public transparency data).
-- Let's make it public transparency for now as "Viral" implies public stats often.
CREATE POLICY "Public viral metrics"
ON viral_metrics FOR SELECT
TO authenticated
USING (true);
-- Sentiment Data Schema

-- Aggregated sentiment scores (Time-series)
CREATE TABLE IF NOT EXISTS social_sentiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'twitter',
  sentiment_score DECIMAL(5, 4) NOT NULL, -- -1.0 to 1.0
  volume INTEGER NOT NULL,
  avg_confidence DECIMAL(5, 4),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for time-series deduplication if needed (optional)
  UNIQUE(symbol, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_sentiment_symbol_time ON social_sentiment(symbol, timestamp DESC);

-- Individual analyzed tweets
CREATE TABLE IF NOT EXISTS sentiment_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_id VARCHAR(50) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(100),
  sentiment VARCHAR(20), -- bullish, bearish, neutral
  confidence DECIMAL(5, 4),
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL, -- Tweet creation time
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tweets_symbol_time ON sentiment_tweets(symbol, created_at DESC);

-- RLS Policies
ALTER TABLE social_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_tweets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read sentiment" 
  ON social_sentiment FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read tweets" 
  ON sentiment_tweets FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Service Role write access (Implicit)
-- Enable uuid-ossp extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. User tiers table
CREATE TABLE user_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Assuming Supabase auth.users or public.users. Usually auth.users for auth, but public.users for profile. Let's check if there is a public.users table.
  -- Reverting to the spec's `users(id)` assuming there is a public users table or alias. 
  -- If not, I should check. But usually in Supabase starter kits there is a public.users or profiles table.
  -- The spec says `REFERENCES users(id)`. I will use `REFERENCES users(id)` if `users` is a table in public schema.
  -- Actually, standard Supabase uses `auth.users`. But often a public `users` or `profiles` table exists.
  -- I'll use `REFERENCES auth.users(id)` for safety if I can't confirm `users` table.
  -- Wait, looking at previous file lists, I don't see schema.
  -- I'll follow the spec strictly: `REFERENCES users(id)`. If it fails, I'll fix it.
  -- Actually, looking at `supabase/migrations/20251124000002_create_withdrawals_table.sql` might give a hint.
  -- Let's quickly check one migration file to see what user table they reference.
  tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
  -- Tracking metrics
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  monthly_volume DECIMAL(20, 2) DEFAULT 0,
  network_depth INTEGER DEFAULT 1,
  -- Commission tracking
  current_commission_rate DECIMAL(5, 4) DEFAULT 0.05,
  total_commission_earned DECIMAL(20, 2) DEFAULT 0,
  total_commission_paid DECIMAL(20, 2) DEFAULT 0,
  -- Gamification
  badges JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '{}',
  streak_months INTEGER DEFAULT 0,
  -- Timestamps
  tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Referral network table
CREATE TABLE referral_network (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1, -- 1=direct, 2-4=network
  status VARCHAR(20) DEFAULT 'active',
  -- Metrics
  referee_volume DECIMAL(20, 2) DEFAULT 0,
  commission_earned DECIMAL(20, 2) DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- 3. Commission pool table
CREATE TABLE commission_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  total_rebate DECIMAL(20, 2) DEFAULT 0,
  total_commission_allocated DECIMAL(20, 2) DEFAULT 0,
  total_commission_paid DECIMAL(20, 2) DEFAULT 0,
  reserve_fund DECIMAL(20, 2) DEFAULT 0,
  scaling_factor DECIMAL(5, 4) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month)
);

-- 4. Commission transactions table
CREATE TABLE commission_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  -- Breakdown
  l1_commission DECIMAL(20, 2) DEFAULT 0,
  l2_commission DECIMAL(20, 2) DEFAULT 0,
  l3_commission DECIMAL(20, 2) DEFAULT 0,
  l4_commission DECIMAL(20, 2) DEFAULT 0,
  bonus_commission DECIMAL(20, 2) DEFAULT 0,
  -- Total
  total_commission DECIMAL(20, 2) DEFAULT 0,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Viral metrics table
CREATE TABLE viral_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  viral_coefficient DECIMAL(5, 2) DEFAULT 0,
  avg_refs_per_user DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  retention_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tiers_tier ON user_tiers(tier);
CREATE INDEX IF NOT EXISTS idx_referral_network_referrer ON referral_network(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_network_referee ON referral_network(referee_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_user ON commission_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_transactions_month ON commission_transactions(month);
CREATE TABLE IF NOT EXISTS affiliate_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  pending_payout NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'rejected')),
  method TEXT, -- 'crypto', 'paypal'
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY affiliate_stats_user_policy ON affiliate_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payout_requests_user_policy ON payout_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payout_requests_insert_policy ON payout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL, -- 'momentum', 'mean_reversion', 'sentiment'
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  description TEXT,
  total_aum NUMERIC DEFAULT 0, -- Assets Under Management
  performance_history JSONB, -- Chart data
  roi_30d NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_id UUID REFERENCES ai_agents(id),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Initial Agents if they don't exist
INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d) 
SELECT 'DeepSeek Alpha', 'sentiment', 'high', 'Trades based on news sentiment and whale movements.', 42.5
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'DeepSeek Alpha');

INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d)
SELECT 'BitFlow Trend', 'momentum', 'medium', 'Follows strong trends on BTC/ETH.', 18.2
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'BitFlow Trend');

INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d)
SELECT 'Stable Grid', 'mean_reversion', 'low', 'Farms volatility in stable ranges.', 5.8
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'Stable Grid');
CREATE TABLE IF NOT EXISTS user_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  graph_data JSONB NOT NULL, -- React Flow nodes/edges
  compiled_config JSONB, -- Executable logic
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_strategies_user ON user_strategies(user_id);
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  seo_keywords TEXT[],
  meta_description TEXT,
  status TEXT CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE TABLE IF NOT EXISTS equity_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('founder', 'investor', 'employee', 'advisor')),
  shares_owned NUMERIC NOT NULL,
  vesting_start TIMESTAMPTZ,
  cliff_months INTEGER,
  vesting_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_valuation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_date TIMESTAMPTZ DEFAULT NOW(),
  pre_money_valuation NUMERIC,
  share_price NUMERIC,
  total_shares NUMERIC
);

-- Insert initial founder data
INSERT INTO equity_holders (name, role, shares_owned, vesting_start, cliff_months, vesting_months)
VALUES 
('Founder', 'founder', 6000000, NOW(), 0, 48),
('Co-Founder', 'founder', 2000000, NOW(), 12, 48),
('Seed Investor', 'investor', 1000000, NOW(), 0, 0),
('ESOP Pool', 'employee', 1000000, NOW(), 0, 0);

INSERT INTO company_valuation (pre_money_valuation, share_price, total_shares)
VALUES (10000000, 1.00, 10000000);
-- supabase/migrations/20251128_competitor_tracking.sql
CREATE TABLE IF NOT EXISTS competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  pricing JSONB,
  features JSONB,
  snapshot_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date DESC);
-- ============================================================================
-- COMPLETE PAYMENT & AI SYSTEM SCHEMA
-- ============================================================================

-- 1. Users table enhancements (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_price NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('pro', 'trader', 'elite')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 3. Transactions table (audit log for all payments)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  -- Payment details
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  -- Provider details
  provider TEXT NOT NULL CHECK (provider IN ('polar', 'nowpayments', 'stripe')),
  provider_transaction_id TEXT UNIQUE,
  provider_customer_id TEXT,
  
  -- Crypto-specific (for NOWPayments)
  crypto_currency TEXT,
  crypto_amount NUMERIC,
  crypto_address TEXT,
  crypto_tx_hash TEXT,
  
  -- Discount tracking
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0,
  original_amount NUMERIC,
  
  -- Metadata
  metadata JSONB,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_provider ON transactions(provider, provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- 4. Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  -- Applicability
  applicable_tiers TEXT[], -- ['pro', 'trader'] or NULL for all
  minimum_purchase NUMERIC,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);

-- 5. Discount redemptions (track who used what code)
CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  saved_amount NUMERIC NOT NULL,
  
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discount_redemptions_code ON discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_user ON discount_redemptions(user_id);

-- 6. AI Usage tracking
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  
  -- Counters
  request_count INTEGER DEFAULT 1,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  
  -- Model breakdown
  openrouter_requests INTEGER DEFAULT 0,
  vertex_requests INTEGER DEFAULT 0,
  model_usage JSONB, -- {"claude-3.5-sonnet": 10, "llama-3-8b": 5}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, request_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage(user_id, request_date);

-- 7. AI Request logs (detailed per-request tracking)
CREATE TABLE IF NOT EXISTS ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Request details
  prompt_length INTEGER,
  completion_length INTEGER,
  complexity TEXT CHECK (complexity IN ('simple', 'medium', 'complex')),
  
  -- Routing
  model_used TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'vertex')),
  fallback_used BOOLEAN DEFAULT FALSE,
  
  -- Cost
  tokens_used INTEGER NOT NULL,
  cost NUMERIC NOT NULL,
  
  -- Performance
  response_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_request_logs_user ON ai_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_request_logs_created ON ai_request_logs(created_at DESC);

-- 8. Email logs (track all automated emails)
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'trial_ending', 'winback', 'payment_success', 'payment_failed')),
  subject TEXT,
  
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced')),
  provider_message_id TEXT,
  
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);

-- ============================================================================
-- SEED INITIAL DATA
-- ============================================================================

-- Discount codes
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses, notes) VALUES
('TRIAL20', 'percentage', 20, 1000, 'Trial users 20% off first month'),
('ANNUAL30', 'percentage', 30, NULL, 'Annual billing 30% discount'),
('WINBACK50', 'percentage', 50, 500, 'Win-back campaign for churned users'),
('FIRSTWIN20', 'percentage', 20, 500, 'First winning trade celebration')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_tokens INTEGER,
  p_cost NUMERIC,
  p_model TEXT,
  p_provider TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
  current_model_usage JSONB;
BEGIN
  INSERT INTO ai_usage (user_id, request_date, request_count, total_tokens, total_cost, model_usage)
  VALUES (
    p_user_id, 
    CURRENT_DATE, 
    1, 
    p_tokens, 
    p_cost,
    jsonb_build_object(p_model, 1)
  )
  ON CONFLICT (user_id, request_date) 
  DO UPDATE SET
    request_count = ai_usage.request_count + 1,
    total_tokens = ai_usage.total_tokens + p_tokens,
    total_cost = ai_usage.total_cost + p_cost,
    openrouter_requests = CASE WHEN p_provider = 'openrouter' THEN ai_usage.openrouter_requests + 1 ELSE ai_usage.openrouter_requests END,
    vertex_requests = CASE WHEN p_provider = 'vertex' THEN ai_usage.vertex_requests + 1 ELSE ai_usage.vertex_requests END,
    model_usage = COALESCE(ai_usage.model_usage, '{}'::jsonb) || jsonb_build_object(
      p_model, 
      COALESCE((ai_usage.model_usage->>p_model)::integer, 0) + 1
    ),
    updated_at = NOW()
  RETURNING request_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    subscription_tier = NEW.tier,
    subscription_status = NEW.status,
    subscription_price = NEW.price,
    subscription_expires_at = NEW.current_period_end
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_user_subscription ON subscriptions;
CREATE TRIGGER trg_update_user_subscription
AFTER INSERT OR UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
DROP POLICY IF EXISTS ai_usage_user_policy ON ai_usage;
CREATE POLICY ai_usage_user_policy ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ai_request_logs_user_policy ON ai_request_logs;
CREATE POLICY ai_request_logs_user_policy ON ai_request_logs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS transactions_user_policy ON transactions;
CREATE POLICY transactions_user_policy ON transactions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS subscriptions_user_policy ON subscriptions;
CREATE POLICY subscriptions_user_policy ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
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
CREATE TABLE IF NOT EXISTS dao_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  amount_staked NUMERIC DEFAULT 0,
  rewards_earned NUMERIC DEFAULT 0,
  lock_period_days INTEGER DEFAULT 30,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'passed', 'rejected')),
  votes_for NUMERIC DEFAULT 0,
  votes_against NUMERIC DEFAULT 0,
  ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES dao_proposals(id),
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('for', 'against')),
  voting_power NUMERIC NOT NULL, -- Based on staked amount
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Seed Proposals
INSERT INTO dao_proposals (title, description, status, ends_at) VALUES
('Add DeepSeek-V3 to AI Fund', 'Proposal to integrate DeepSeek-V3 model for sentiment analysis strategy.', 'active', NOW() + INTERVAL '7 days'),
('Increase Staking APY', 'Boost staking rewards to 25% for 1-year lockups to incentivize long-term holding.', 'active', NOW() + INTERVAL '3 days'),
('List on Uniswap', 'Official proposal to create APEX/ETH pool on Uniswap V3.', 'passed', NOW() - INTERVAL '1 day');
-- Note: The tables discount_codes and discount_redemptions were already included in 
-- supabase/migrations/20251128_complete_payment_system.sql
-- This migration file ensures they exist and adds any missing parts if needed.

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  
  -- Applicability
  applicable_tiers TEXT[], -- ['pro', 'trader'] or NULL for all
  minimum_purchase NUMERIC,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  saved_amount NUMERIC NOT NULL,
  
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (Safe to run if exists logic handled by CREATE INDEX IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_code ON discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_user ON discount_redemptions(user_id);

-- Seed initial codes (ON CONFLICT DO NOTHING handles existing codes)
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses, notes) VALUES
('TRIAL20', 'percentage', 20, 1000, 'Trial users 20% off first month'),
('ANNUAL30', 'percentage', 30, NULL, 'Annual billing 30% discount'),
('WINBACK50', 'percentage', 50, 500, 'Win-back campaign for churned users'),
('FIRSTWIN20', 'percentage', 20, 500, 'First winning trade celebration')
ON CONFLICT (code) DO NOTHING;

-- Function to safely increment usage count
CREATE OR REPLACE FUNCTION increment_discount_usage(code_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1
  WHERE id = code_id;
END;
$$ LANGUAGE plpgsql;
CREATE TABLE IF NOT EXISTS enterprise_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES auth.users(id), -- The B2B Client
  key_hash TEXT NOT NULL, -- Store SHA-256 hash, never plain text
  key_prefix TEXT NOT NULL, -- "apx_live_..."
  name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{read_signals}', 
  rate_limit INTEGER DEFAULT 1000, -- Requests per minute
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enterprise_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES enterprise_api_keys(id),
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enterprise_usage_key ON enterprise_usage(api_key_id);
-- Function to safely increment agent AUM
CREATE OR REPLACE FUNCTION increment_agent_aum(p_agent_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_agents
  SET total_aum = total_aum + p_amount
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  step_connect_wallet BOOLEAN DEFAULT FALSE,
  step_view_signal BOOLEAN DEFAULT FALSE,
  step_run_backtest BOOLEAN DEFAULT FALSE,
  step_join_telegram BOOLEAN DEFAULT FALSE,
  step_refer_friend BOOLEAN DEFAULT FALSE,
  reward_claimed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user ON user_onboarding(user_id);

-- RLS
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding"
  ON user_onboarding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding"
  ON user_onboarding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding"
  ON user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = user_id);
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
  SELECT COALESCE(SUM(amount), 0) INTO total_claimed
  FROM pending_vault
  WHERE user_id = p_user_id
    AND status = 'pending'
    AND expires_at > NOW();

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

CREATE TABLE IF NOT EXISTS user_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  auth TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cleanup (optional, but good for finding old records)
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- RLS: Only service role should access this usually, but for simplicity in this MVP we allow public read/write if needed, 
-- OR better: keep it private and only access via Service Role Client in the API route.
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow Service Role full access (default)
-- We don't add public policies because rate limiting is a backend system function.
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  code TEXT UNIQUE NOT NULL,
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id),
  referred_user_id UUID REFERENCES auth.users(id),
  referral_code TEXT,
  
  -- Earnings tracking
  subscription_revenue NUMERIC, 
  commission_amount NUMERIC, 
  commission_paid BOOLEAN DEFAULT FALSE,
  
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON referral_conversions(referrer_id);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS recovery_codes TEXT[];

CREATE TABLE IF NOT EXISTS active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'login', '2fa_enable', 'withdraw'
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON security_audit_logs(user_id);
CREATE TABLE IF NOT EXISTS virtual_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  balance NUMERIC DEFAULT 100000.00, -- $100k Start
  currency TEXT DEFAULT 'USDT',
  reset_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS virtual_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  symbol TEXT NOT NULL, -- BTC/USDT
  side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  entry_price NUMERIC NOT NULL,
  size NUMERIC NOT NULL, -- Amount in USDT
  leverage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  pnl NUMERIC DEFAULT 0,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_virtual_positions_user ON virtual_positions(user_id);
CREATE TABLE IF NOT EXISTS hive_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  long_ratio NUMERIC NOT NULL, -- % of bots/users Long
  short_ratio NUMERIC NOT NULL, -- % of bots/users Short
  active_participants INTEGER NOT NULL,
  confidence_score NUMERIC NOT NULL, -- Based on historical accuracy of participants
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL, -- 'database', 'price_feed', 'execution'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  latency_ms INTEGER,
  action_taken TEXT, -- 'rerouted', 'restarted', 'notified'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hive_signals_created ON hive_signals(created_at DESC);
CREATE TABLE IF NOT EXISTS copy_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id),
  leader_id UUID REFERENCES auth.users(id),
  allocation_amount NUMERIC NOT NULL, -- Amount to dedicate to this leader
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  profit_sharing_rate NUMERIC DEFAULT 0.10, -- 10%
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, leader_id)
);

CREATE TABLE IF NOT EXISTS copy_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES copy_relationships(id),
  original_order_id UUID, -- Reference to Leader's order (virtual_positions id)
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC,
  size NUMERIC,
  pnl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copy_rel_leader ON copy_relationships(leader_id);
CREATE INDEX IF NOT EXISTS idx_copy_pos_rel ON copy_positions(relationship_id);
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Seed
INSERT INTO system_config (key, value) VALUES
('maintenance_mode', '"false"'),
('trading_fee_rate', '0.001'), -- 0.1%
('withdrawal_enabled', '"true"')
ON CONFLICT (key) DO NOTHING;
CREATE TABLE IF NOT EXISTS presale_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Seed', 'Private', 'Public'
  price NUMERIC NOT NULL, -- $0.05
  token_allocation NUMERIC NOT NULL,
  tokens_sold NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended'))
);

CREATE TABLE IF NOT EXISTS presale_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  round_id UUID REFERENCES presale_rounds(id),
  amount_usdt NUMERIC NOT NULL,
  token_amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_amount NUMERIC DEFAULT 0
);

-- Seed Data
INSERT INTO presale_rounds (name, price, token_allocation, tokens_sold, start_time, end_time, status)
VALUES 
('Seed Round', 0.02, 50000000, 45000000, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 day', 'ended'),
('Public Sale', 0.05, 100000000, 12500000, NOW(), NOW() + INTERVAL '14 days', 'active');
CREATE TABLE IF NOT EXISTS usage_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  charge_type TEXT NOT NULL, -- 'signal_used', 'alert_triggered', etc.
  amount NUMERIC NOT NULL,
  signal_id TEXT,
  charged_at TIMESTAMPTZ NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_charges_user ON usage_charges(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_charges_paid ON usage_charges(paid);-- Whale Activity Tracking

CREATE TABLE IF NOT EXISTS whale_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    amount_usd DECIMAL(20, 2) NOT NULL,
    transaction_hash VARCHAR(100),
    direction VARCHAR(10) NOT NULL, -- 'IN', 'OUT'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(transaction_hash)
);

CREATE INDEX IF NOT EXISTS idx_whale_symbol_time ON whale_activity(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_amount ON whale_activity(amount_usd DESC);

-- RLS Policies
ALTER TABLE whale_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read whale activity"
  ON whale_activity FOR SELECT
  TO authenticated, anon
  USING (true);
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'fund-a', 'exchange-b'
  custom_domain TEXT UNIQUE,
  theme_config JSONB DEFAULT '{"primaryColor": "#10b981", "logoUrl": "/logo.png"}'::jsonb,
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users to tenants
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON auth.users(tenant_id);

-- RLS for Multi-Tenancy
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Users can read their own tenant info
CREATE POLICY tenant_read_policy ON tenants
  FOR SELECT USING (id = (select tenant_id from auth.users where id = auth.uid()));

-- Only Super Admin can create tenants
-- (Assuming super_admin logic exists or manual insert for now)
-- Unified Trading Signals Table

CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    prediction VARCHAR(10) NOT NULL, -- BUY, SELL, HOLD
    confidence DECIMAL(5, 4) NOT NULL, -- 0.0 to 1.0
    entry_price DECIMAL(20, 8),
    
    -- Explainability
    price_contrib DECIMAL(5, 4),
    sentiment_contrib DECIMAL(5, 4),
    volume_contrib DECIMAL(5, 4),
    
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- active, executed, expired
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_signals_latest ON trading_signals(symbol, timestamp DESC);

-- RLS
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read signals"
  ON trading_signals FOR SELECT
  TO authenticated, anon
  USING (true);
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);

-- Add trial_ends_at to users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
