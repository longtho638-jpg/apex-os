-- ============================================================================
-- FIX MIGRATION SCRIPT (Safe Reset for New Tables)
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. Cleanup potentially broken tables (Safe to drop as they are new features)
DROP TABLE IF EXISTS ai_request_logs CASCADE;
DROP TABLE IF EXISTS ai_usage CASCADE;
DROP TABLE IF EXISTS discount_redemptions CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS usage_charges CASCADE;
DROP TABLE IF EXISTS transactions CASCADE; -- We use payment_transactions for old data, this is new
DROP TABLE IF EXISTS competitor_snapshots CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;

-- 2. Ensure public.users exists (Critical for foreign keys)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add columns to users if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_tier') THEN
        ALTER TABLE public.users ADD COLUMN subscription_tier TEXT DEFAULT 'free';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
        ALTER TABLE public.users ADD COLUMN subscription_status TEXT DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_price') THEN
        ALTER TABLE public.users ADD COLUMN subscription_price NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'subscription_expires_at') THEN
        ALTER TABLE public.users ADD COLUMN subscription_expires_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE public.users ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'canceled_at') THEN
        ALTER TABLE public.users ADD COLUMN canceled_at TIMESTAMPTZ;
    END IF;
END $$;

-- 4. Recreate Tables Correctly

-- Competitor Tracking
CREATE TABLE competitor_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  pricing JSONB,
  features JSONB,
  snapshot_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_competitor_snapshots_date ON competitor_snapshots(snapshot_date DESC);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subscription_id UUID, -- Loose reference to avoid circular dependency issues
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  provider TEXT NOT NULL CHECK (provider IN ('polar', 'nowpayments', 'stripe')),
  provider_transaction_id TEXT UNIQUE,
  provider_customer_id TEXT,
  crypto_currency TEXT,
  crypto_amount NUMERIC,
  crypto_address TEXT,
  crypto_tx_hash TEXT,
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0,
  original_amount NUMERIC,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Discount Codes
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  applicable_tiers TEXT[],
  minimum_purchase NUMERIC,
  created_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_discount_codes_code ON discount_codes(code);

-- Discount Redemptions
CREATE TABLE discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_code_id UUID REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  saved_amount NUMERIC NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_discount_redemptions_code ON discount_redemptions(discount_code_id);
CREATE INDEX idx_discount_redemptions_user ON discount_redemptions(user_id);

-- AI Usage
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  request_date DATE NOT NULL,
  request_count INTEGER DEFAULT 1,
  total_tokens INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  openrouter_requests INTEGER DEFAULT 0,
  vertex_requests INTEGER DEFAULT 0,
  model_usage JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, request_date)
);
CREATE INDEX idx_ai_usage_user_date ON ai_usage(user_id, request_date);

-- AI Request Logs
CREATE TABLE ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  prompt_length INTEGER,
  completion_length INTEGER,
  complexity TEXT CHECK (complexity IN ('simple', 'medium', 'complex')),
  model_used TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openrouter', 'vertex')),
  fallback_used BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER NOT NULL,
  cost NUMERIC NOT NULL,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ai_request_logs_user ON ai_request_logs(user_id);

-- Email Logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'trial_ending', 'winback', 'payment_success', 'payment_failed')),
  subject TEXT,
  status TEXT CHECK (status IN ('sent', 'failed', 'bounced')),
  provider_message_id TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ
);
CREATE INDEX idx_email_logs_user ON email_logs(user_id);

-- User Onboarding
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) UNIQUE,
  step_connect_exchange BOOLEAN DEFAULT FALSE,
  step_view_signal BOOLEAN DEFAULT FALSE,
  step_execute_trade BOOLEAN DEFAULT FALSE,
  step_set_alerts BOOLEAN DEFAULT FALSE,
  step_refer_friend BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_user_onboarding_user ON user_onboarding(user_id);

-- Usage Charges
CREATE TABLE usage_charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  charge_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  signal_id TEXT,
  charged_at TIMESTAMPTZ NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usage_charges_user ON usage_charges(user_id);

-- 5. Seed Data
INSERT INTO discount_codes (code, discount_type, discount_value, max_uses, notes) VALUES
('TRIAL20', 'percentage', 20, 1000, 'Trial users 20% off first month'),
('ANNUAL30', 'percentage', 30, NULL, 'Annual billing 30% discount'),
('WINBACK50', 'percentage', 50, 500, 'Win-back campaign for churned users'),
('FIRSTWIN20', 'percentage', 20, 500, 'First winning trade celebration')
ON CONFLICT (code) DO NOTHING;

-- 6. RLS Policies
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_usage_user_policy ON ai_usage;
CREATE POLICY ai_usage_user_policy ON ai_usage FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ai_request_logs_user_policy ON ai_request_logs;
CREATE POLICY ai_request_logs_user_policy ON ai_request_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS transactions_user_policy ON transactions;
CREATE POLICY transactions_user_policy ON transactions FOR SELECT USING (auth.uid() = user_id);
