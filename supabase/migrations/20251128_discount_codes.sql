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
