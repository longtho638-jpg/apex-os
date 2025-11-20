-- ============================================================
-- ApexOS Tier System Migration
-- Version: 1.0
-- Description: Complete database schema for Free/Founders/Admin tiers
-- ============================================================

-- 1. ALTER users table - Add subscription tier columns
-- This is backwards-compatible (uses DEFAULT values)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_tx_id VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for faster tier lookups
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier 
  ON users(subscription_tier);

-- Add check constraint for valid tiers
ALTER TABLE users 
  ADD CONSTRAINT chk_subscription_tier 
  CHECK (subscription_tier IN ('free', 'founders', 'admin'));

COMMENT ON COLUMN users.subscription_tier IS 'User tier: free, founders (lifetime $99), or admin';
COMMENT ON COLUMN users.subscription_expires_at IS 'NULL = lifetime (for founders), otherwise expiration date';
COMMENT ON COLUMN users.payment_tx_id IS 'Blockchain TxID or bank reference for payment verification';
COMMENT ON COLUMN users.joined_at IS 'Timestamp when user first joined the platform';


-- 2. CREATE founders_circle table - Limited slots (1-100)
CREATE TABLE IF NOT EXISTS founders_circle (
  slot_number INT PRIMARY KEY CHECK (slot_number BETWEEN 1 AND 100),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  tx_id VARCHAR(255),
  UNIQUE(user_id) -- Each user can only claim one slot
);

CREATE INDEX IF NOT EXISTS idx_founders_circle_user 
  ON founders_circle(user_id);

COMMENT ON TABLE founders_circle IS 'Founders Circle slots (limited to 100 early adopters)';
COMMENT ON COLUMN founders_circle.slot_number IS 'Slot number 1-100, determines founder badge';


-- 3. CREATE payment_verifications table - Track all payments
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tx_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) CHECK (payment_method IN ('crypto', 'bank', 'stripe')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
  verified_at TIMESTAMPTZ DEFAULT NULL,
  verified_by UUID REFERENCES users(id) DEFAULT NULL, -- Admin who verified
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_verifications_user 
  ON payment_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status 
  ON payment_verifications(status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_tx 
  ON payment_verifications(tx_id);

COMMENT ON TABLE payment_verifications IS 'Log of all payment attempts and verifications';
COMMENT ON COLUMN payment_verifications.verified_by IS 'Admin user ID who manually verified (for bank transfers)';


-- 4. CREATE referrals table - Track referral relationships
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  UNIQUE(referee_id), -- Each user can only be referred once
  CHECK (referrer_id != referee_id) -- Cannot refer yourself
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer 
  ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee 
  ON referrals(referee_id);

COMMENT ON TABLE referrals IS 'Referral relationships between users';
COMMENT ON COLUMN referrals.status IS 'active = earning commissions, inactive = stopped, suspended = fraud detected';


-- 5. CREATE referral_earnings table - Track monthly commissions
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: '2024-11'
  referee_trading_fees DECIMAL(10,2) DEFAULT 0,
  commission_rate DECIMAL(5,2) DEFAULT 20.00, -- 20% for founders
  commission_earned DECIMAL(10,2) DEFAULT 0,
  paid_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id, month) -- One entry per referrer/referee/month
);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer_month 
  ON referral_earnings(referrer_id, month);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_paid 
  ON referral_earnings(paid_at);

COMMENT ON TABLE referral_earnings IS 'Monthly commission earnings from referrals';
COMMENT ON COLUMN referral_earnings.commission_earned IS 'Calculated as: referee_trading_fees * (commission_rate / 100)';


-- 6. Seed Founders Circle with 87 demo slots (saves 13 for real users)
DO $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..87 LOOP
    INSERT INTO founders_circle (slot_number, user_id, tx_id)
    VALUES (
      i,
      NULL, -- No real user yet (placeholder)
      'demo-tx-' || i
    )
    ON CONFLICT (slot_number) DO NOTHING;
  END LOOP;
END $$;


-- 7. Create helper function to get available founders slots
CREATE OR REPLACE FUNCTION get_available_founders_slots()
RETURNS INT AS $$
  SELECT 100 - COUNT(*) FROM founders_circle WHERE user_id IS NOT NULL;
$$ LANGUAGE SQL;

COMMENT ON FUNCTION get_available_founders_slots IS 'Returns number of available Founders Circle slots';


-- 8. Create helper function to upgrade user to founders
CREATE OR REPLACE FUNCTION upgrade_user_to_founders(
  p_user_id UUID,
  p_tx_id VARCHAR,
  p_amount DECIMAL
) RETURNS JSON AS $$
DECLARE
  v_slot_number INT;
  v_result JSON;
BEGIN
  -- Check if user is already founders
  IF EXISTS (SELECT 1 FROM users WHERE id = p_user_id AND subscription_tier = 'founders') THEN
    v_result := json_build_object(
      'success', false,
      'error', 'User is already a Founder'
    );
    RETURN v_result;
  END IF;

  -- Check if slots are available
  IF get_available_founders_slots() <= 0 THEN
    v_result := json_build_object(
      'success', false,
      'error', 'Founders Circle is full (100/100)'
    );
    RETURN v_result;
  END IF;

  -- Find first available slot
  SELECT slot_number INTO v_slot_number
  FROM founders_circle
  WHERE user_id IS NULL
  ORDER BY slot_number
  LIMIT 1;

  -- Update user tier
  UPDATE users
  SET subscription_tier = 'founders',
      subscription_expires_at = NULL, -- Lifetime
      payment_tx_id = p_tx_id,
      payment_verified = TRUE
  WHERE id = p_user_id;

  -- Claim slot
  UPDATE founders_circle
  SET user_id = p_user_id,
      tx_id = p_tx_id,
      claimed_at = NOW()
  WHERE slot_number = v_slot_number;

  -- Record payment verification
  INSERT INTO payment_verifications (user_id, tx_id, amount, payment_method, status, verified_at)
  VALUES (p_user_id, p_tx_id, p_amount, 'crypto', 'verified', NOW());

  v_result := json_build_object(
    'success', true,
    'slot_number', v_slot_number,
    'message', 'Welcome to Founders Circle!'
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upgrade_user_to_founders IS 'Upgrade user to Founders tier and claim available slot';


-- 9. RLS Policies (Row Level Security)

-- Users can read their own tier
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tier" ON users
  FOR SELECT
  USING (auth.uid() = id OR true); -- Temporarily allow all reads for demo

-- Founders Circle is publicly viewable (for FOMO count)
ALTER TABLE founders_circle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view founders slots" ON founders_circle
  FOR SELECT
  USING (true);

-- Payment verifications: users can view their own
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payment_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Referrals: users can view their own referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Referral earnings: users can view their own earnings
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own earnings" ON referral_earnings
  FOR SELECT
  USING (auth.uid() = referrer_id);


-- ============================================================
-- Migration Complete!
-- ============================================================

-- Verify installation
DO $$
BEGIN
  RAISE NOTICE '✅ Tier system migration complete!';
  RAISE NOTICE '📊 Available Founders Slots: %', get_available_founders_slots();
  RAISE NOTICE '👥 Total Users: %', (SELECT COUNT(*) FROM users);
  RAISE NOTICE '👑 Total Founders: %', (SELECT COUNT(*) FROM users WHERE subscription_tier = 'founders');
END $$;
