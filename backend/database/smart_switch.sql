-- Apex Smart-Switch Database Schema
-- Security Level: Institutional

-- 1. Exchange Configurations (The Vault Entry)
-- Stores encrypted Master API Keys for Admin use only.
CREATE TABLE IF NOT EXISTS exchange_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exchange VARCHAR(50) NOT NULL, -- 'binance', 'bybit', etc.
    master_api_key_encrypted TEXT NOT NULL, -- Encrypted via VaultService
    master_api_secret_encrypted TEXT NOT NULL, -- Encrypted via VaultService
    partner_uuid VARCHAR(100), -- Apex's Partner ID on the exchange
    referral_link TEXT, -- Deep link for users to create sub-accounts
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exchange)
);

-- 2. User Exchange Accounts
-- Links User's Apex Account to their Exchange UID
CREATE TABLE IF NOT EXISTS user_exchange_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange VARCHAR(50) NOT NULL,
    user_uid VARCHAR(100) NOT NULL, -- The UID user inputs
    account_type VARCHAR(20) DEFAULT 'MAIN', -- 'MAIN' or 'SUB'
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, exchange, user_uid)
);

-- 3. Verification Audit Log
-- Security audit trail for all verification attempts
CREATE TABLE IF NOT EXISTS verification_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    exchange VARCHAR(50) NOT NULL,
    user_uid VARCHAR(100),
    action VARCHAR(50) NOT NULL, -- 'VERIFY_ATTEMPT', 'VERIFY_SUCCESS', 'VERIFY_FAILED'
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB, -- Store error details, fraud scores, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_exchange_accounts_user_id ON user_exchange_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_user_id ON verification_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_log_ip ON verification_audit_log(ip_address);
