-- Phase GTM-02: Add Compliance Tracking Columns
-- Created: 2026-02-04
-- Purpose: Track user acceptance of Terms of Service and Privacy Policy

-- Add compliance columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS tos_accepted_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_accepted_version VARCHAR(20),
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cookie_consent_given BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cookie_consent_at TIMESTAMPTZ;

-- Comments
COMMENT ON COLUMN users.tos_accepted_version IS 'Version of ToS user accepted (e.g., "1.0", "2.1")';
COMMENT ON COLUMN users.tos_accepted_at IS 'Timestamp when user accepted ToS';
COMMENT ON COLUMN users.privacy_accepted_version IS 'Version of Privacy Policy user accepted';
COMMENT ON COLUMN users.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN users.cookie_consent_given IS 'Whether user gave cookie consent';
COMMENT ON COLUMN users.cookie_consent_at IS 'Timestamp when user gave cookie consent';

-- Create index for compliance queries
CREATE INDEX IF NOT EXISTS idx_users_compliance ON users(tos_accepted_version, privacy_accepted_version);

NOTIFY pgrst, 'reload schema';
