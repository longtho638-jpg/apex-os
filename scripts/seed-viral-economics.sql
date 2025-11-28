-- ============================================
-- VIRAL ECONOMICS SEED DATA
-- ============================================

DO $$
DECLARE
  -- REPLACE THESE WITH REAL USER IDs FROM YOUR AUTH.USERS TABLE
  -- Run: SELECT id FROM auth.users LIMIT 4;
  user1_id UUID := '00000000-0000-0000-0000-000000000001'; -- FREE
  user2_id UUID := '00000000-0000-0000-0000-000000000002'; -- BASIC
  user3_id UUID := '00000000-0000-0000-0000-000000000003'; -- TRADER
  user4_id UUID := '00000000-0000-0000-0000-000000000004'; -- PRO
BEGIN

  -- Check if users exist in auth.users (Optional safety check)
  -- IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user1_id) THEN
  --   RAISE NOTICE 'User 1 not found. Please update UUIDs.';
  -- END IF;

  -- ============================================
  -- 1. Seed user_tiers
  -- ============================================
  
  -- User 1: FREE
  INSERT INTO user_tiers (user_id, tier, total_referrals, active_referrals, monthly_volume, current_commission_rate)
  VALUES (user1_id, 'FREE', 0, 0, 0, 0.05)
  ON CONFLICT (user_id) DO UPDATE SET tier='FREE';

  -- User 2: BASIC (Referred by User 1)
  INSERT INTO user_tiers (user_id, tier, total_referrals, active_referrals, monthly_volume, current_commission_rate, total_commission_earned)
  VALUES (user2_id, 'BASIC', 5, 5, 10000.00, 0.10, 500.00)
  ON CONFLICT (user_id) DO UPDATE SET tier='BASIC';

  -- User 3: TRADER (Referred by User 2)
  INSERT INTO user_tiers (user_id, tier, total_referrals, active_referrals, monthly_volume, current_commission_rate, total_commission_earned)
  VALUES (user3_id, 'TRADER', 20, 18, 50000.00, 0.20, 2500.00)
  ON CONFLICT (user_id) DO UPDATE SET tier='TRADER';

  -- User 4: PRO (Referred by User 3)
  INSERT INTO user_tiers (user_id, tier, total_referrals, active_referrals, monthly_volume, current_commission_rate, total_commission_earned)
  VALUES (user4_id, 'PRO', 50, 48, 200000.00, 0.30, 12000.00)
  ON CONFLICT (user_id) DO UPDATE SET tier='PRO';

  -- ============================================
  -- 2. Seed referral_network
  -- ============================================

  -- User 1 -> User 2 (Direct)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user1_id, user2_id, 1, 'active', 10000.00, 400.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- User 2 -> User 3 (Direct)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user2_id, user3_id, 1, 'active', 50000.00, 1000.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- User 1 -> User 3 (Indirect Level 2)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user1_id, user3_id, 2, 'active', 50000.00, 100.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- User 3 -> User 4 (Direct)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user3_id, user4_id, 1, 'active', 200000.00, 4000.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- User 2 -> User 4 (Indirect Level 2)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user2_id, user4_id, 2, 'active', 200000.00, 400.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- User 1 -> User 4 (Indirect Level 3)
  INSERT INTO referral_network (referrer_id, referee_id, level, status, referee_volume, commission_earned)
  VALUES (user1_id, user4_id, 3, 'active', 200000.00, 200.00)
  ON CONFLICT (referrer_id, referee_id) DO NOTHING;

  -- ============================================
  -- 3. Seed commission_pool (Monthly)
  -- ============================================
  
  INSERT INTO commission_pool (month, total_rebate, total_commission_allocated, total_commission_paid, reserve_fund, scaling_factor)
  VALUES 
    ('2025-11', 100000.00, 85000.00, 80000.00, 5000.00, 0.95),
    ('2025-10', 95000.00, 80000.00, 80000.00, 0.00, 1.00)
  ON CONFLICT (month) DO NOTHING;

  -- ============================================
  -- 4. Seed commission_transactions
  -- ============================================

  -- Example transaction for User 2
  INSERT INTO commission_transactions (user_id, month, tier, l1_commission, l2_commission, total_commission, status)
  VALUES (user2_id, '2025-11', 'BASIC', 400.00, 80.00, 500.00, 'paid');

END $$;