-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    leader_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_volume NUMERIC DEFAULT 0,
    invite_code TEXT UNIQUE
);

-- Add team_id to users (public profile or auth.users? usually public users table)
-- Assuming 'users' is the public profile table linked to auth.users
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_role TEXT DEFAULT 'member'; -- 'alpha', 'beta', 'member'

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
