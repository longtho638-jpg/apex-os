-- Add copy_leader_id to positions table to track copied trades
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS copy_leader_id UUID REFERENCES copy_leaders(id);

-- Ensure positions table exists (if not already created by previous migrations)
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL, -- LONG, SHORT
    entry_price NUMERIC NOT NULL,
    size NUMERIC NOT NULL,
    leverage NUMERIC DEFAULT 1,
    entry_time TIMESTAMPTZ DEFAULT NOW(),
    exit_price NUMERIC,
    exit_time TIMESTAMPTZ,
    pnl NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can see their own positions" ON positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own positions" ON positions FOR INSERT WITH CHECK (auth.uid() = user_id);
