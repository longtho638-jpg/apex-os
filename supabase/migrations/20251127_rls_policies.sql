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
