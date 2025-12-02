
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing DATABASE_URL in .env.local');
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

const sql = `
-- Unified Trading Signals Table

CREATE TABLE IF NOT EXISTS trading_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    prediction VARCHAR(10) NOT NULL, -- BUY, SELL, HOLD
    confidence DECIMAL(5, 4) NOT NULL, -- 0.0 to 1.0
    entry_price DECIMAL(20, 8),
    
    -- Explainability
    price_contrib DECIMAL(5, 4),
    sentiment_contrib DECIMAL(5, 4),
    volume_contrib DECIMAL(5, 4),
    
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active', -- active, executed, expired
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trading_signals_latest ON trading_signals(symbol, timestamp DESC);

-- RLS
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read signals" ON trading_signals;

CREATE POLICY "Public read signals"
  ON trading_signals FOR SELECT
  TO authenticated, anon
  USING (true);
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB. Creating trading_signals table...');
    await client.query(sql);
    console.log('Table created successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
