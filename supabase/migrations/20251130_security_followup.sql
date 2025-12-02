-- SECURITY FOLLOW-UP MIGRATION
-- Date: 2025-11-30

-- 1. PREPARE API KEYS TABLE FOR HASHING
-- We add a new column first to migrate data safely without breaking functionality immediately.
ALTER TABLE IF EXISTS api_keys 
ADD COLUMN IF NOT EXISTS hashed_secret TEXT;

-- 2. SECURE RPC FOR PUBLIC SETTINGS
-- Instead of opening the whole 'system_settings' table, we use a function
-- to return ONLY specific whitelist keys safe for the public/frontend.

CREATE OR REPLACE FUNCTION get_public_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (bypassing RLS on the table)
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_object_agg(key, value)
    INTO result
    FROM system_settings
    WHERE key IN (
        'site_name', 
        'maintenance_mode', 
        'support_email', 
        'min_withdrawal_limit',
        'enable_registrations'
    ); -- ⚠️ EDIT THIS LIST: Only add keys that are safe to be public!
    
    RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_public_system_settings() TO anon, authenticated, service_role;
