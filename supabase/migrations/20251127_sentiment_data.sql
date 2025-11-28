-- Sentiment Data Schema

-- Aggregated sentiment scores (Time-series)
CREATE TABLE IF NOT EXISTS social_sentiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'twitter',
  sentiment_score DECIMAL(5, 4) NOT NULL, -- -1.0 to 1.0
  volume INTEGER NOT NULL,
  avg_confidence DECIMAL(5, 4),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for time-series deduplication if needed (optional)
  UNIQUE(symbol, timestamp)
);

CREATE INDEX IF NOT EXISTS idx_sentiment_symbol_time ON social_sentiment(symbol, timestamp DESC);

-- Individual analyzed tweets
CREATE TABLE IF NOT EXISTS sentiment_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_id VARCHAR(50) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(100),
  sentiment VARCHAR(20), -- bullish, bearish, neutral
  confidence DECIMAL(5, 4),
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL, -- Tweet creation time
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tweets_symbol_time ON sentiment_tweets(symbol, created_at DESC);

-- RLS Policies
ALTER TABLE social_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_tweets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read sentiment" 
  ON social_sentiment FOR SELECT 
  TO authenticated, anon
  USING (true);

CREATE POLICY "Public read tweets" 
  ON sentiment_tweets FOR SELECT 
  TO authenticated, anon
  USING (true);

-- Service Role write access (Implicit)
