-- =====================================================
-- RLS Policies for user_exchange_accounts
-- Purpose: Allow users to manage their own exchange accounts for Tier 2 (Claim Rebates)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable RLS on user_exchange_accounts table (if not already enabled)
ALTER TABLE user_exchange_accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can view own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can update own exchange accounts" ON user_exchange_accounts;
DROP POLICY IF EXISTS "Users can delete own exchange accounts" ON user_exchange_accounts;

-- =====================================================
-- POLICY 1: INSERT - Users can link their own exchange accounts
-- =====================================================
CREATE POLICY "Users can insert own exchange accounts"
ON user_exchange_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLICY 2: SELECT - Users can view their own exchange accounts
-- =====================================================
CREATE POLICY "Users can view own exchange accounts"
ON user_exchange_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- POLICY 3: UPDATE - Users can update their own exchange accounts
-- Note: This is for re-verification or status updates
-- =====================================================
CREATE POLICY "Users can update own exchange accounts"
ON user_exchange_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLICY 4: DELETE - Users can unlink their own exchange accounts
-- =====================================================
CREATE POLICY "Users can delete own exchange accounts"
ON user_exchange_accounts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- ADMIN OVERRIDE: Service role can do anything (for backend APIs)
-- =====================================================
CREATE POLICY "Service role can manage all exchange accounts"
ON user_exchange_accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- Verification: Check policies are applied correctly
-- =====================================================
-- Run this query to verify policies:
-- SELECT * FROM pg_policies WHERE tablename = 'user_exchange_accounts';

-- =====================================================
-- Test queries (optional)
-- =====================================================
/*
-- Test 1: Try to insert as authenticated user (should succeed if user_id = auth.uid())
INSERT INTO user_exchange_accounts (user_id, exchange, user_uid, verification_status)
VALUES (auth.uid(), 'binance', '12345678', 'pending');

-- Test 2: Try to view your own records (should succeed)
SELECT * FROM user_exchange_accounts WHERE user_id = auth.uid();

-- Test 3: Try to view other users' records (should return empty)
SELECT * FROM user_exchange_accounts WHERE user_id != auth.uid();
*/
