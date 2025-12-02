-- Copy Trading Schema

-- 1. Copy Leaders Table (Users who can be copied)
CREATE TABLE IF NOT EXISTS copy_leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    total_pnl NUMERIC DEFAULT 0,
    win_rate NUMERIC DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    active_followers INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Copy Settings Table (Relationships between Follower and Leader)
CREATE TABLE IF NOT EXISTS copy_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    leader_id UUID REFERENCES copy_leaders(id) ON DELETE CASCADE,
    copy_amount NUMERIC NOT NULL DEFAULT 1000, -- Amount allocated to copy
    copy_ratio NUMERIC NOT NULL DEFAULT 1.0, -- 1.0 = 100% size match (adjusted for balance)
    stop_loss_percent NUMERIC DEFAULT 20, -- Stop copying if drawdown exceeds this
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, STOPPED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, leader_id)
);

-- 3. Copy Trade History (Audit log of copied trades)
CREATE TABLE IF NOT EXISTS copy_trade_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    copy_setting_id UUID REFERENCES copy_settings(id),
    original_trade_id UUID, -- Reference to leader's trade
    follower_trade_id UUID, -- Reference to follower's executed trade
    pnl NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE copy_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for leaders" ON copy_leaders FOR SELECT USING (true);
CREATE POLICY "Users can manage their own leader profile" ON copy_leaders FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can see their own copy settings" ON copy_settings FOR SELECT USING (auth.uid() = follower_id);
CREATE POLICY "Users can manage their own copy settings" ON copy_settings FOR ALL USING (auth.uid() = follower_id);
