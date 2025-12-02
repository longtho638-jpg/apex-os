-- Snapshot of admin_users table schema
-- Created to address "Ghost Table" issue where admin_users was referenced before definition.

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
