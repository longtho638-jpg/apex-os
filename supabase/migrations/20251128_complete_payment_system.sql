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
  FOR SELECT USING (auth.uid() = user_id);