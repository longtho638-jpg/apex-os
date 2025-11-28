-- Cold Storage Wallets Table
CREATE TABLE IF NOT EXISTS cold_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL, -- e.g., "Ledger Nano X - Vault 1"
    address TEXT NOT NULL,
    chain TEXT DEFAULT 'ETH' NOT NULL, -- ETH, BTC, SOL, etc.
    balance DECIMAL(20, 8) DEFAULT 0,
    currency TEXT DEFAULT 'USDT',
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'COMPROMISED')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cold_wallets_status ON cold_wallets(status);

-- RLS
ALTER TABLE cold_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cold wallets" ON cold_wallets
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage cold wallets" ON cold_wallets
    FOR ALL
    USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- Insert some mock data for visualization
INSERT INTO cold_wallets (label, address, chain, balance, currency)
VALUES 
    ('Vault Alpha (Ledger)', '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', 'ETH', 1500000.00, 'USDT'),
    ('Vault Beta (Trezor)', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'BTC', 12.5, 'BTC'),
    ('Solana Deep Storage', '5U3bH5b6XtG99aC6tH99aC6tH99aC6tH99aC6tH99aC6', 'SOL', 45000.00, 'SOL');
