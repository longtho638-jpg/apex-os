CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy_type TEXT NOT NULL, -- 'momentum', 'mean_reversion', 'sentiment'
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  description TEXT,
  total_aum NUMERIC DEFAULT 0, -- Assets Under Management
  performance_history JSONB, -- Chart data
  roi_30d NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_id UUID REFERENCES ai_agents(id),
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Initial Agents if they don't exist
INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d) 
SELECT 'DeepSeek Alpha', 'sentiment', 'high', 'Trades based on news sentiment and whale movements.', 42.5
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'DeepSeek Alpha');

INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d)
SELECT 'BitFlow Trend', 'momentum', 'medium', 'Follows strong trends on BTC/ETH.', 18.2
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'BitFlow Trend');

INSERT INTO ai_agents (name, strategy_type, risk_level, description, roi_30d)
SELECT 'Stable Grid', 'mean_reversion', 'low', 'Farms volatility in stable ranges.', 5.8
WHERE NOT EXISTS (SELECT 1 FROM ai_agents WHERE name = 'Stable Grid');
