-- =====================================================
-- COMPREHENSIVE RLS AUDIT & ENFORCEMENT
-- Date: 2025-11-26
-- Purpose: Enforce strict multi-tenancy and role-based access
-- =====================================================

-- 1. Enable RLS on ALL critical tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABLE: audit_logs
-- Security: High. Only Service Role can INSERT. Admins can SELECT. Users: NONE.
-- =====================================================
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR role = 'super_admin')
  )
);

CREATE POLICY "Service role can insert audit logs"
ON audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- =====================================================
-- TABLE: withdrawals
-- Security: Users see own. Admins see all.
-- =====================================================
DROP POLICY IF EXISTS "Users can view own withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Users can create withdrawals" ON withdrawals;

CREATE POLICY "Users can view own withdrawals"
ON withdrawals FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create withdrawals"
ON withdrawals FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all withdrawals"
ON withdrawals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

CREATE POLICY "Admins can update withdrawals"
ON withdrawals FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  )
);

-- =====================================================
-- TABLE: transactions
-- Security: Read-only for users. Insert by System/Service Role only (usually).
-- =====================================================
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
ON transactions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- =====================================================
-- TABLE: api_keys
-- Security: Users manage own keys.
-- =====================================================
DROP POLICY IF EXISTS "Users can manage own api keys" ON api_keys;

CREATE POLICY "Users can manage own api keys"
ON api_keys FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =====================================================
-- TABLE: admin_users
-- Security: Only Super Admins can manage. Admins can view self.
-- =====================================================
DROP POLICY IF EXISTS "Super Admins manage admins" ON admin_users;
DROP POLICY IF EXISTS "Admins view self" ON admin_users;

CREATE POLICY "Super Admins manage admins"
ON admin_users FOR ALL
TO authenticated
USING (
  (SELECT role FROM admin_users WHERE id = auth.uid()) = 'super_admin'
);

CREATE POLICY "Admins view self"
ON admin_users FOR SELECT
TO authenticated
USING (id = auth.uid());

