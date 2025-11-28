-- ============================================
-- VIRAL ECONOMICS VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor after migration
-- ============================================

-- 1. Verify all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN (
  'user_tiers', 
  'referral_network', 
  'commission_pool', 
  'commission_transactions', 
  'viral_metrics'
)
ORDER BY table_name;

-- Expected: 5 rows returned

-- ============================================
-- 2. Verify indexes exist
SELECT 
  tablename, 
  indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN (
  'user_tiers', 
  'referral_network', 
  'commission_transactions'
)
ORDER BY tablename, indexname;

-- Expected: At least 6 indexes

-- ============================================
-- 3. Check table structures
-- user_tiers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_tiers'
ORDER BY ordinal_position;

-- ============================================
-- 4. Check constraints and foreign keys
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN (
  'user_tiers', 
  'referral_network', 
  'commission_transactions'
);

-- ============================================
-- 5. Test insert user_tier (replace with real user_id from auth.users)
-- First, get a real user ID:
SELECT id, email FROM auth.users LIMIT 1;

-- Then insert a test tier (replace YOUR_USER_ID):
-- INSERT INTO user_tiers (user_id, tier) 
-- VALUES ('YOUR_USER_ID', 'FREE');

-- ============================================
-- 6. Verify data can be queried
SELECT 
  'user_tiers' as table_name, 
  COUNT(*) as row_count 
FROM user_tiers
UNION ALL
SELECT 
  'referral_network', 
  COUNT(*) 
FROM referral_network
UNION ALL
SELECT 
  'commission_pool', 
  COUNT(*) 
FROM commission_pool
UNION ALL
SELECT 
  'commission_transactions', 
  COUNT(*) 
FROM commission_transactions
UNION ALL
SELECT 
  'viral_metrics', 
  COUNT(*) 
FROM viral_metrics;

-- ============================================
-- 7. Check if uuid-ossp extension is enabled
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Expected: 1 row with uuid-ossp

-- ============================================
-- SUCCESS CRITERIA:
-- ✅ All 5 tables exist with correct column counts
-- ✅ All 6 indexes created
-- ✅ Foreign keys reference auth.users correctly
-- ✅ uuid-ossp extension enabled
-- ✅ Can query all tables without errors
-- ============================================
