-- ==============================================================================
-- MIGRATION: Add IP Whitelisting to Admin Users
-- ==============================================================================
-- Created: 2025-11-23
-- Purpose: Enable IP-based access control for admin accounts
-- ==============================================================================

-- Add IP whitelist columns to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS allowed_ips INET[],
ADD COLUMN IF NOT EXISTS ip_whitelist_enabled BOOLEAN DEFAULT FALSE;

-- Add GIN index for fast IP array lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_allowed_ips 
ON admin_users USING GIN (allowed_ips);

-- Add comments for documentation
COMMENT ON COLUMN admin_users.allowed_ips IS 'Array of whitelisted IP addresses (supports CIDR notation like 192.168.1.0/24)';
COMMENT ON COLUMN admin_users.ip_whitelist_enabled IS 'Whether IP whitelisting is active for this admin (optional per-admin)';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'IP whitelist columns added successfully to admin_users table';
END $$;
