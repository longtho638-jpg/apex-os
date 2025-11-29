-- Deep Security Lockdown
-- Explicitly secure users and admin_users tables

-- 1. Secure 'users' table
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
  -- Note: To strictly prevent 'is_admin' update if it existed, we would need a trigger.
  -- But since we use 'admin_users' table for roles, this is safer.

-- 2. Secure 'admin_users' table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  mfa_enabled BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admins can view their own record
DROP POLICY IF EXISTS "Admins can view self" ON admin_users;
CREATE POLICY "Admins can view self"
  ON admin_users FOR SELECT
  USING (auth.uid() = id);

-- CRITICAL: DENY all other operations to public/authenticated users
-- Only Service Role (server-side) can INSERT/UPDATE/DELETE admin_users
-- This prevents privilege escalation via API.

-- 3. Audit Log Security
-- Ensure audit logs are read-only for everyone (even admins via client)
-- They should only be written by system/server.
CREATE TABLE IF NOT EXISTS withdrawal_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  withdrawal_id UUID,
  event_type VARCHAR(50),
  actor VARCHAR(100),
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  metadata JSONB,
  checksum VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE withdrawal_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own audit logs" ON withdrawal_audit_log;
CREATE POLICY "Read own audit logs"
  ON withdrawal_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM withdrawal_requests 
      WHERE withdrawal_requests.id = withdrawal_audit_log.withdrawal_id 
      AND withdrawal_requests.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE policy for authenticated users on audit logs.
