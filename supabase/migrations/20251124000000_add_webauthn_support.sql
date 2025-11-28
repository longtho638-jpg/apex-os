-- Create table for storing WebAuthn/FIDO2 security keys
CREATE TABLE IF NOT EXISTS admin_security_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE NOT NULL,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL, -- Stored as Base64 or similar
    counter BIGINT DEFAULT 0 NOT NULL,
    transports JSONB DEFAULT '[]'::JSONB, -- e.g., ["usb", "nfc", "ble"]
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMPTZ,
    nickname TEXT -- e.g., "My YubiKey 5"
);

-- Index for fast lookups by admin_id
CREATE INDEX IF NOT EXISTS idx_admin_security_keys_admin_id ON admin_security_keys(admin_id);

-- Index for looking up by credential_id (during login)
CREATE INDEX IF NOT EXISTS idx_admin_security_keys_credential_id ON admin_security_keys(credential_id);

-- Add RLS policies
ALTER TABLE admin_security_keys ENABLE ROW LEVEL SECURITY;

-- Admins can view their own keys
CREATE POLICY "Admins can view own security keys" ON admin_security_keys
    FOR SELECT
    USING (auth.uid() = admin_id);

-- Admins can delete their own keys
CREATE POLICY "Admins can delete own security keys" ON admin_security_keys
    FOR DELETE
    USING (auth.uid() = admin_id);

-- Only service role can insert/update (via API) to ensure validation
-- (Or allow insert if admin_id matches auth.uid(), but usually registration is a specific flow)
