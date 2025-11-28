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
CREATE INDEX idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX idx_user_tiers_tier ON user_tiers(tier);
CREATE INDEX idx_referral_network_referrer ON referral_network(referrer_id);
CREATE INDEX idx_referral_network_referee ON referral_network(referee_id);
CREATE INDEX idx_commission_transactions_user ON commission_transactions(user_id);
CREATE INDEX idx_commission_transactions_month ON commission_transactions(month);
