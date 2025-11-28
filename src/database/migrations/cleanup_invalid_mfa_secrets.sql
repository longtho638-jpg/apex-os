-- ==============================================================================
-- MIGRATION: Clean Up Invalid MFA Secrets
-- ==============================================================================
-- Purpose: Remove any MFA secrets that were encrypted with wrong/old keys
-- This allows fresh MFA setup with the current VAULT_KEY_MASTER
-- ==============================================================================

-- Remove all MFA secrets and reset MFA status for all admins
UPDATE admin_users 
SET 
    mfa_enabled = false,
    mfa_secret = NULL
WHERE mfa_secret IS NOT NULL;

-- Log the cleanup
DO $$
DECLARE
    affected_count INTEGER;
BEGIN
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RAISE NOTICE 'Cleaned up % admin accounts with invalid MFA secrets', affected_count;
    RAISE NOTICE 'All admins can now setup MFA fresh with correct encryption key';
END $$;
