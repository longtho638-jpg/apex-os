-- IB Auto-Linking: User Exchange Accounts Table
-- Purpose: Store user exchange account UIDs and verification status

-- Drop existing table if needed
DROP TABLE IF EXISTS public.user_exchange_accounts CASCADE;

-- Create main table
CREATE TABLE public.user_exchange_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL CHECK (exchange IN ('binance', 'bybit', 'okx', 'bitget', 'kucoin', 'mexc', 'gate', 'htx', 'bingx', 'phemex', 'coinex', 'bitmart')),
    user_uid VARCHAR(100) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'needs_relink')),
    linked_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    verification_attempts INT DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_exchange UNIQUE(user_id, exchange)
);

-- Create index for faster lookups
CREATE INDEX idx_user_exchange_accounts_user_id ON public.user_exchange_accounts(user_id);
CREATE INDEX idx_user_exchange_accounts_exchange ON public.user_exchange_accounts(exchange);
CREATE INDEX idx_user_exchange_accounts_status ON public.user_exchange_accounts(verification_status);

-- Enable RLS
ALTER TABLE public.user_exchange_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own accounts
CREATE POLICY "Users can view own exchange accounts"
    ON public.user_exchange_accounts
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own accounts
CREATE POLICY "Users can insert own exchange accounts"
    ON public.user_exchange_accounts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own accounts
CREATE POLICY "Users can update own exchange accounts"
    ON public.user_exchange_accounts
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_user_exchange_accounts_updated_at
    BEFORE UPDATE ON public.user_exchange_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (optional, adjust as needed)
GRANT SELECT, INSERT, UPDATE ON public.user_exchange_accounts TO authenticated;
GRANT SELECT ON public.user_exchange_accounts TO anon;

-- Sample query to check table
-- SELECT * FROM public.user_exchange_accounts WHERE user_id = 'your-uuid';
