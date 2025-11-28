-- ==============================================================================
-- MIGRATION: Add MFA Support to Admin Users
-- ==============================================================================
-- Created: 2025-11-23
-- Purpose: Enable Multi-Factor Authentication for admin accounts
-- ==============================================================================

-- Add MFA columns to admin_users table
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mfa_secret TEXT, -- Encrypted TOTP secret
ADD COLUMN IF NOT EXISTS mfa_recovery_codes TEXT[]; -- Array of hashed recovery codes (bcrypt)

-- Add index for faster MFA lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_mfa_enabled 
ON admin_users(mfa_enabled) 
WHERE mfa_enabled = TRUE;

-- Add comment for documentation
COMMENT ON COLUMN admin_users.mfa_enabled IS 'Whether MFA is enabled for this admin account';
COMMENT ON COLUMN admin_users.mfa_secret IS 'Encrypted TOTP secret for generating time-based codes';
COMMENT ON COLUMN admin_users.mfa_recovery_codes IS 'Hashed backup codes (10 codes, bcrypt hashed)';

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'MFA columns added successfully to admin_users table';
END $$;
