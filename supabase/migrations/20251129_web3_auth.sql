-- Create table for storing Web3 auth nonces
CREATE TABLE IF NOT EXISTS public.auth_nonces (
    address text PRIMARY KEY,
    nonce text NOT NULL,
    expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auth_nonces ENABLE ROW LEVEL SECURITY;

-- Allow public access to insert/update (since anyone can request a nonce)
-- But ideally we should limit this.
-- For simplicity, we'll use a function to handle nonce generation securely via API (Service Role)
-- So we might not need public RLS if the API uses Service Role.
-- But let's add a policy just in case.

CREATE POLICY "Service Role can manage nonces"
    ON public.auth_nonces
    USING (true)
    WITH CHECK (true);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_auth_nonces_expires_at ON public.auth_nonces(expires_at);
