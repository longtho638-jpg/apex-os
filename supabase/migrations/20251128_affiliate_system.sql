CREATE TABLE IF NOT EXISTS affiliate_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  pending_payout NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'rejected')),
  method TEXT, -- 'crypto', 'paypal'
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE affiliate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY affiliate_stats_user_policy ON affiliate_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payout_requests_user_policy ON payout_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payout_requests_insert_policy ON payout_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
