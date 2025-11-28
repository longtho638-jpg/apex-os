-- Verification Script for Realtime Wallet System
-- Run this in Supabase SQL Editor after applying migrations

BEGIN;

-- 1. Check Tables Exist
SELECT 
  table_name, 
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = t.table_name
  ) as exists
FROM (
  VALUES 
    ('user_wallets'),
    ('commission_events'),
    ('withdrawal_requests'),
    ('withdrawal_audit_log')
) as t(table_name);

-- 2. Check Functions Exist
SELECT 
  routine_name,
  EXISTS (
    SELECT FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name = r.routine_name
  ) as exists
FROM (
  VALUES 
    ('credit_user_balance_realtime'),
    ('reserve_balance_for_withdrawal'),
    ('release_reserved_balance'),
    ('finalize_withdrawal')
) as r(routine_name);

-- 3. Test Function Logic (Rollback transaction after test)
DO $$
DECLARE
  v_user_id UUID;
  v_withdrawal_id UUID;
  v_result BOOLEAN;
BEGIN
  -- Create test user (if not exists, we need a valid UUID, usually from auth.users)
  -- For this test, we'll just use a random UUID and assume RLS is bypassed or we are superuser
  v_user_id := uuid_generate_v4();
  
  -- 3.1 Test Credit Balance
  PERFORM credit_user_balance_realtime(
    v_user_id, 
    100.00, 
    'test_credit', 
    '{"test": true}'::jsonb
  );
  
  IF NOT EXISTS (SELECT 1 FROM user_wallets WHERE user_id = v_user_id AND balance_usd = 100.00) THEN
    RAISE EXCEPTION 'Credit balance failed';
  END IF;
  
  -- 3.2 Test Reserve Balance
  v_withdrawal_id := uuid_generate_v4();
  
  -- Insert dummy withdrawal request linked to no user just for ID (or skip FK check if needed, but better to be correct)
  -- Since we don't have a real user in auth.users, foreign key constraints might fail if enabled.
  -- This verification script is best run where constraints are satisfied.
  -- Assuming we can run this, let's try to reserve 50.
  
  SELECT reserve_balance_for_withdrawal(v_user_id, 50.00, v_withdrawal_id) INTO v_result;
  
  IF v_result IS FALSE THEN
    RAISE EXCEPTION 'Reserve balance returned FALSE';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM user_wallets WHERE user_id = v_user_id AND balance_usd = 50.00 AND reserved_balance = 50.00) THEN
    RAISE EXCEPTION 'Reserve balance update failed';
  END IF;

  RAISE NOTICE 'All Realtime Wallet System tests PASSED successfully!';
END $$;

ROLLBACK; -- Always rollback test data
