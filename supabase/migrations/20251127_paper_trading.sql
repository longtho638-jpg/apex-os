-- Paper Trading Schema

-- Virtual Wallets
CREATE TABLE paper_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance_usdt DECIMAL(20, 2) DEFAULT 100000.00, -- Start with 100k paper money
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Paper Trades
CREATE TABLE paper_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(4) NOT NULL, -- BUY, SELL
    type VARCHAR(10) NOT NULL, -- LIMIT, MARKET
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    status VARCHAR(20) DEFAULT 'FILLED', -- FILLED, OPEN, CANCELLED
    pnl DECIMAL(20, 8) DEFAULT 0, -- Realized PnL
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper Positions (Active holdings)
CREATE TABLE paper_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID REFERENCES paper_wallets(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_entry_price DECIMAL(20, 8) NOT NULL,
    current_price DECIMAL(20, 8), -- Updated via job
    unrealized_pnl DECIMAL(20, 8) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_id, symbol)
);
