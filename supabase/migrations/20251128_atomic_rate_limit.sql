-- ============================================
-- Atomic Rate Limit Increment
-- Prevents race conditions in rate limiting
-- ============================================

-- Note: rate_limits table already exists from 20251128_rate_limit.sql
-- We only add the atomic functions here

CREATE OR REPLACE FUNCTION increment_rate_limit(
    p_identifier TEXT,
    p_window_start BIGINT,  -- Changed from TIMESTAMPTZ to BIGINT to match existing schema
    p_window_seconds INTEGER DEFAULT 60
) RETURNS TABLE(count INTEGER, is_blocked BOOLEAN) AS $$
DECLARE
    v_count INTEGER;
    v_max_requests INTEGER := 100; -- Default limit, can be parameterized
    v_key TEXT;
BEGIN
    -- Generate key from identifier and window
    v_key := p_identifier || ':' || p_window_start::TEXT;
    
    -- Atomic upsert with increment
    INSERT INTO rate_limits (key, count, window_start, updated_at)
    VALUES (
        v_key,
        1,
        p_window_start,
        NOW()
    )
    ON CONFLICT (key)
    DO UPDATE SET 
        count = rate_limits.count + 1,
        updated_at = NOW()
    RETURNING rate_limits.count INTO v_count;
    
    -- Return count and whether blocked
    RETURN QUERY SELECT 
        v_count,
        v_count > v_max_requests AS is_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant to service role
GRANT EXECUTE ON FUNCTION increment_rate_limit TO service_role;
GRANT EXECUTE ON FUNCTION increment_rate_limit TO authenticated;

-- Cleanup function (call via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
    v_expiry_threshold BIGINT;
BEGIN
    -- Delete records older than 1 hour (3600000 milliseconds)
    v_expiry_threshold := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 - 3600000;
    
    DELETE FROM rate_limits
    WHERE window_start < v_expiry_threshold;
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_rate_limit IS 
'Atomically increment rate limit counter with upsert to prevent race conditions';

COMMENT ON FUNCTION cleanup_expired_rate_limits IS 
'Remove expired rate limit entries - should be called via cron job';
