CREATE TABLE IF NOT EXISTS equity_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('founder', 'investor', 'employee', 'advisor')),
  shares_owned NUMERIC NOT NULL,
  vesting_start TIMESTAMPTZ,
  cliff_months INTEGER,
  vesting_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_valuation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_date TIMESTAMPTZ DEFAULT NOW(),
  pre_money_valuation NUMERIC,
  share_price NUMERIC,
  total_shares NUMERIC
);

-- Insert initial founder data
INSERT INTO equity_holders (name, role, shares_owned, vesting_start, cliff_months, vesting_months)
VALUES 
('Founder', 'founder', 6000000, NOW(), 0, 48),
('Co-Founder', 'founder', 2000000, NOW(), 12, 48),
('Seed Investor', 'investor', 1000000, NOW(), 0, 0),
('ESOP Pool', 'employee', 1000000, NOW(), 0, 0);

INSERT INTO company_valuation (pre_money_valuation, share_price, total_shares)
VALUES (10000000, 1.00, 10000000);
