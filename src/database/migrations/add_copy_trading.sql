-- Phase 4.3: Copy Trading System
-- Created: 2025-11-24
-- Purpose: Leader/Follower trading replication

CREATE TABLE IF NOT EXISTS copy_trading_leaders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    total_followers INT DEFAULT 0,
    total_pnl DECIMAL(20, 2) DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    total_trades INT DEFAULT 0,
    is_accepting_followers BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS copy_trading_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leader_id UUID REFERENCES copy_trading_leaders(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL,
    copy_ratio DECIMAL(5, 2) DEFAULT 1.0 CHECK (copy_ratio > 0 AND copy_ratio <= 2.0),
    max_copy_amount DECIMAL(20, 2),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(leader_id, follower_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_copy_leaders_user ON copy_trading_leaders(user_id);
CREATE INDEX IF NOT EXISTS idx_copy_followers_leader ON copy_trading_followers(leader_id, is_active);
CREATE INDEX IF NOT EXISTS idx_copy_followers_follower ON copy_trading_followers(follower_id);

-- View for leader leaderboard
CREATE OR REPLACE VIEW copy_trading_leaderboard AS
SELECT 
    l.*,
    COUNT(f.id) as active_followers
FROM copy_trading_leaders l
LEFT JOIN copy_trading_followers f ON l.id = f.leader_id AND f.is_active = true
WHERE l.is_accepting_followers = true
GROUP BY l.id
ORDER BY l.total_pnl DESC, l.win_rate DESC;

COMMENT ON TABLE copy_trading_leaders IS 'Traders who allow others to copy their trades';
COMMENT ON TABLE copy_trading_followers IS 'Users following and copying leader trades';
COMMENT ON COLUMN copy_trading_followers.copy_ratio IS 'Multiplier for trade size (1.0 = same size, 0.5 = half size)';

NOTIFY pgrst, 'reload schema';
