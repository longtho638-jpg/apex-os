CREATE TABLE IF NOT EXISTS presale_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Seed', 'Private', 'Public'
  price NUMERIC NOT NULL, -- $0.05
  token_allocation NUMERIC NOT NULL,
  tokens_sold NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended'))
);

CREATE TABLE IF NOT EXISTS presale_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  round_id UUID REFERENCES presale_rounds(id),
  amount_usdt NUMERIC NOT NULL,
  token_amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_amount NUMERIC DEFAULT 0
);

-- Seed Data
INSERT INTO presale_rounds (name, price, token_allocation, tokens_sold, start_time, end_time, status)
VALUES 
('Seed Round', 0.02, 50000000, 45000000, NOW() - INTERVAL '1 month', NOW() - INTERVAL '1 day', 'ended'),
('Public Sale', 0.05, 100000000, 12500000, NOW(), NOW() + INTERVAL '14 days', 'active');
