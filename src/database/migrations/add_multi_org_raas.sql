-- ============================================================
-- MULTI-ORG RaaS MIGRATION
-- Transforms single-tenant SaaS into multi-org zero-fee model
-- ============================================================

-- 1. Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    plan TEXT DEFAULT 'EXPLORER', -- tier determined by aggregate org volume
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    settings JSONB DEFAULT '{}'::jsonb,
    total_volume NUMERIC(20,8) DEFAULT 0,
    monthly_volume NUMERIC(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Organization members (many-to-many: user <-> org)
CREATE TABLE IF NOT EXISTS org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'trader', 'viewer', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- 3. Add org_id to core tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- Wallets: org-level funding pools
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- Orders: track which org placed the order
ALTER TABLE orders ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- Positions: org-level position tracking
ALTER TABLE positions ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- 4. Referral codes table (was missing)
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    org_id UUID REFERENCES organizations(id),
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER, -- NULL = unlimited
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Referral network table (ensure exists for commission tracking)
CREATE TABLE IF NOT EXISTS referral_network (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES auth.users(id) NOT NULL,
    referee_id UUID REFERENCES auth.users(id) NOT NULL,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    status TEXT DEFAULT 'active',
    referee_volume NUMERIC(20,8) DEFAULT 0,
    commission_earned NUMERIC(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referrer_id, referee_id, level)
);

-- 6. User tiers table (ensure exists for tier tracking)
CREATE TABLE IF NOT EXISTS user_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
    org_id UUID REFERENCES organizations(id),
    tier TEXT DEFAULT 'EXPLORER',
    monthly_volume NUMERIC(20,8) DEFAULT 0,
    total_volume NUMERIC(20,8) DEFAULT 0,
    active_referrals INTEGER DEFAULT 0,
    current_commission_rate NUMERIC(6,4) DEFAULT 0.20,
    badges JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    tier_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Commission pool table
CREATE TABLE IF NOT EXISTS commission_pool (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL UNIQUE,
    total_rebate NUMERIC(20,8) DEFAULT 0,
    total_commission_allocated NUMERIC(20,8) DEFAULT 0,
    scaling_factor NUMERIC(6,4) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Commission transactions table
CREATE TABLE IF NOT EXISTS commission_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    org_id UUID REFERENCES organizations(id),
    month TEXT NOT NULL,
    tier TEXT NOT NULL,
    l1_commission NUMERIC(20,8) DEFAULT 0,
    l2_commission NUMERIC(20,8) DEFAULT 0,
    l3_commission NUMERIC(20,8) DEFAULT 0,
    l4_commission NUMERIC(20,8) DEFAULT 0,
    bonus_commission NUMERIC(20,8) DEFAULT 0,
    total_commission NUMERIC(20,8) DEFAULT 0,
    multiplier NUMERIC(6,4) DEFAULT 1.0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Agent workflows table (for agentic automation)
CREATE TABLE IF NOT EXISTS agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    agent_type TEXT NOT NULL, -- signal-follower, dca-bot, grid-trader, etc.
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'stopped', 'error')),
    last_execution_at TIMESTAMPTZ,
    total_trades INTEGER DEFAULT 0,
    total_pnl NUMERIC(20,8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Withdrawal requests table (ensure exists)
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    org_id UUID REFERENCES organizations(id),
    amount NUMERIC(20,8) NOT NULL,
    crypto_address TEXT NOT NULL,
    network TEXT DEFAULT 'trc20',
    status TEXT DEFAULT 'pending',
    risk_score NUMERIC(4,2) DEFAULT 0,
    agent_notes TEXT,
    data_checksum TEXT,
    tx_hash TEXT,
    tx_fee NUMERIC(20,8),
    payout_provider TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Withdrawal audit log
CREATE TABLE IF NOT EXISTS withdrawal_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    withdrawal_id UUID REFERENCES withdrawal_requests(id),
    event_type TEXT NOT NULL,
    actor TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON org_members(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_wallets_org ON wallets(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_positions_org ON positions(org_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_network_referrer ON referral_network(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_network_referee ON referral_network(referee_id);
CREATE INDEX IF NOT EXISTS idx_user_tiers_user ON user_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tiers_org ON user_tiers(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_tx_user ON commission_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_tx_month ON commission_transactions(month);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_org ON agent_workflows(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_workflows_user ON agent_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user ON withdrawal_requests(user_id);

-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- Credit user balance in realtime (atomic)
CREATE OR REPLACE FUNCTION credit_user_balance_realtime(
    p_user_id UUID,
    p_amount NUMERIC,
    p_source TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    -- Credit wallet
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id AND currency = 'USDT';

    -- Log transaction
    INSERT INTO transactions (wallet_id, type, amount, reference_id, metadata)
    SELECT w.id, p_source, p_amount, p_source, p_metadata
    FROM wallets w WHERE w.user_id = p_user_id AND w.currency = 'USDT';
END;
$$ LANGUAGE plpgsql;

-- Increment user volume (atomic)
CREATE OR REPLACE FUNCTION increment_user_volume(
    p_user_id UUID,
    p_volume NUMERIC
) RETURNS VOID AS $$
BEGIN
    UPDATE user_tiers
    SET monthly_volume = monthly_volume + p_volume,
        total_volume = total_volume + p_volume,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Also update org volume if user belongs to org
    UPDATE organizations o
    SET monthly_volume = monthly_volume + p_volume,
        total_volume = total_volume + p_volume,
        updated_at = NOW()
    FROM users u
    WHERE u.id = p_user_id AND u.org_id = o.id;
END;
$$ LANGUAGE plpgsql;

-- Finalize withdrawal (deduct from balance)
CREATE OR REPLACE FUNCTION finalize_withdrawal(
    p_user_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    UPDATE wallets
    SET balance = balance - p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id AND currency = 'USDT';
END;
$$ LANGUAGE plpgsql;

-- Release reserved balance (on failed withdrawal)
CREATE OR REPLACE FUNCTION release_reserved_balance(
    p_user_id UUID,
    p_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
    -- Re-credit the reserved amount
    UPDATE wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id AND currency = 'USDT';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Organizations: members can view their own org
CREATE POLICY org_member_select ON organizations
    FOR SELECT USING (
        id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
        OR owner_id = auth.uid()
    );

-- Org members: can view members of their org
CREATE POLICY org_members_select ON org_members
    FOR SELECT USING (
        org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    );

-- Agent workflows: users manage their own
CREATE POLICY agent_workflows_user ON agent_workflows
    FOR ALL USING (user_id = auth.uid());

-- Referral codes: users manage their own
CREATE POLICY referral_codes_user ON referral_codes
    FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON TABLE organizations IS 'Multi-org container for RaaS zero-fee model';
COMMENT ON TABLE org_members IS 'Organization membership with role-based access';
COMMENT ON TABLE referral_codes IS 'User referral codes for viral growth';
COMMENT ON TABLE referral_network IS 'Multi-level referral network (L1-L4)';
COMMENT ON TABLE user_tiers IS 'Volume-based tier tracking per user';
COMMENT ON TABLE agent_workflows IS 'Agentic trading workflow configurations';
COMMENT ON TABLE commission_pool IS 'Monthly commission pool for distribution';
COMMENT ON TABLE commission_transactions IS 'Individual commission payout records';
