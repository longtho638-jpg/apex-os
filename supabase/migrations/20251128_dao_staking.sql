CREATE TABLE IF NOT EXISTS dao_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  amount_staked NUMERIC DEFAULT 0,
  rewards_earned NUMERIC DEFAULT 0,
  lock_period_days INTEGER DEFAULT 30,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'passed', 'rejected')),
  votes_for NUMERIC DEFAULT 0,
  votes_against NUMERIC DEFAULT 0,
  ends_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES dao_proposals(id),
  user_id UUID REFERENCES auth.users(id),
  vote_type TEXT CHECK (vote_type IN ('for', 'against')),
  voting_power NUMERIC NOT NULL, -- Based on staked amount
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);

-- Seed Proposals
INSERT INTO dao_proposals (title, description, status, ends_at) VALUES
('Add DeepSeek-V3 to AI Fund', 'Proposal to integrate DeepSeek-V3 model for sentiment analysis strategy.', 'active', NOW() + INTERVAL '7 days'),
('Increase Staking APY', 'Boost staking rewards to 25% for 1-year lockups to incentivize long-term holding.', 'active', NOW() + INTERVAL '3 days'),
('List on Uniswap', 'Official proposal to create APEX/ETH pool on Uniswap V3.', 'passed', NOW() - INTERVAL '1 day');
