-- Phase 5.2: Add IP Whitelisting
-- Created: 2025-11-24
-- Purpose: IP-based access control for admin users

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS allowed_ips TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_admin_users_allowed_ips ON admin_users USING GIN(allowed_ips);

COMMENT ON COLUMN admin_users.allowed_ips IS 'Whitelisted IP addresses for this admin user. Empty array = allow all IPs';

NOTIFY pgrst, 'reload schema';
