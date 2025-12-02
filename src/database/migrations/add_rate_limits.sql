-- Create rate_limits table for API throttling
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    points INTEGER DEFAULT 0,
    expire BIGINT
);

-- Enable RLS (though this table is usually for middleware/service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role full access" ON public.rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Index for expiration cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_expire ON public.rate_limits(expire);
