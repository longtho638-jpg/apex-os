-- Create DAO Proposals table
CREATE TABLE IF NOT EXISTS dao_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'pending', 'executed')),
    proposal_type TEXT DEFAULT 'general',
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    ends_at TIMESTAMPTZ NOT NULL,
    votes_for NUMERIC DEFAULT 0,
    votes_against NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view proposals" ON dao_proposals
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create proposals" ON dao_proposals
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Create DAO Votes table (to track who voted)
CREATE TABLE IF NOT EXISTS dao_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES dao_proposals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    vote_type TEXT CHECK (vote_type IN ('for', 'against', 'abstain')),
    voting_power NUMERIC DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(proposal_id, user_id)
);

ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes" ON dao_votes
    FOR SELECT USING (true);

CREATE POLICY "Users can vote once" ON dao_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
