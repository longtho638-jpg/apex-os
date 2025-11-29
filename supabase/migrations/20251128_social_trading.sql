CREATE TABLE IF NOT EXISTS copy_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id),
  leader_id UUID REFERENCES auth.users(id),
  allocation_amount NUMERIC NOT NULL, -- Amount to dedicate to this leader
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  profit_sharing_rate NUMERIC DEFAULT 0.10, -- 10%
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, leader_id)
);

CREATE TABLE IF NOT EXISTS copy_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES copy_relationships(id),
  original_order_id UUID, -- Reference to Leader's order (virtual_positions id)
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC,
  size NUMERIC,
  pnl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copy_rel_leader ON copy_relationships(leader_id);
CREATE INDEX IF NOT EXISTS idx_copy_pos_rel ON copy_positions(relationship_id);
