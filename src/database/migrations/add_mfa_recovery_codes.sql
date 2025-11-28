-- Phase 5.1: Add MFA Recovery Codes
-- Created: 2025-11-24
-- Purpose: Recovery codes for MFA account access

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS mfa_recovery_codes TEXT[];

COMMENT ON COLUMN admin_users.mfa_recovery_codes IS 'Hashed recovery codes for MFA recovery (10 single-use codes)';

NOTIFY pgrst, 'reload schema';
