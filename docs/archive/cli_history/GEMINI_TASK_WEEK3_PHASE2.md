# GEMINI TASK: Week 3 Phase 2 - Sentiment Analysis ML Service

**Objective**: Build Python-based sentiment analysis service for crypto market sentiment using FinBERT.

**Context**: 
- Phase 1 (Twitter API Client) is COMPLETE with passing tests
- We now need the ML backend to analyze collected tweets
- Must integrate with existing Supabase database and API structure

---

## 🎯 DELIVERABLES

### 1. **Sentiment Analyzer Core** (`backend/ml/sentiment_analyzer.py`)
**Requirements**:
- Use FinBERT (ProsusAI/finbert) pre-trained model
- Classify tweets as: Bullish / Bearish / Neutral
- Return confidence scores (0-1)
- Aggregate sentiment across multiple tweets
- Time-weighted scoring (recent tweets = higher weight)

**Key Functions**:
```python
class SentimentAnalyzer:
    def analyze_tweet(text: str) -> dict  # Single tweet sentiment
    def aggregate_sentiment(tweets: list) -> float  # Aggregate score -1 to +1
    def batch_analyze(tweets: list) -> list  # Batch processing for efficiency
```

**Performance Requirements**:
- Analysis time: <500ms per tweet
- Batch processing: Support 100+ tweets
- Model initialization: Load once, reuse
- Memory efficient (handle rate limiting gracefully)

---

### 2. **Database Integration** (`supabase/migrations/20251127_sentiment_data.sql`)

**Tables to Create**:

```sql
-- Aggregated sentiment scores
CREATE TABLE social_sentiment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  source VARCHAR(50) NOT NULL,  -- 'twitter', 'reddit', 'news'
  sentiment_score DECIMAL(5, 4) NOT NULL,  -- -1 (bearish) to +1 (bullish)
  volume INTEGER NOT NULL,  -- number of posts analyzed
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_sentiment_symbol_time (symbol, timestamp DESC)
);

-- Individual analyzed tweets
CREATE TABLE sentiment_tweets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tweet_id VARCHAR(50) UNIQUE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  text TEXT NOT NULL,
  author VARCHAR(100),
  sentiment VARCHAR(20),  -- 'bullish', 'bearish', 'neutral'
  confidence DECIMAL(5, 4),
  likes INTEGER,
  retweets INTEGER,
  created_at TIMESTAMPTZ NOT NULL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE social_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_tweets ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read sentiment" ON social_sentiment FOR SELECT USING (true);
CREATE POLICY "Public read tweets" ON sentiment_tweets FOR SELECT USING (true);
```

---

### 3. **API Endpoint** (`backend/api/sentiment.py`)

**FastAPI Endpoint**:
```python
from fastapi import APIRouter

router = APIRouter()

@router.post("/api/sentiment/analyze")
async def analyze_sentiment(request: SentimentRequest):
    """
    Analyze sentiment for a list of tweets.
    Returns aggregated sentiment score + individual tweet sentiments.
    """
    pass

@router.get("/api/sentiment/{symbol}")
async def get_sentiment(symbol: str, timeframe: str = "1h"):
    """
    Get current sentiment score for a symbol.
    Timeframe: 1h, 4h, 24h, 7d
    """
    pass
```

**Response Format**:
```json
{
  "symbol": "BTC",
  "sentiment_score": 0.67,
  "sentiment_label": "bullish",
  "volume": 247,
  "timeframe": "1h",
  "breakdown": {
    "bullish": 156,
    "neutral": 62,
    "bearish": 29
  },
  "confidence": 0.84,
  "timestamp": "2025-11-27T10:00:00Z"
}
```

---

### 4. **Scheduled Agent** (`backend/agents/sentiment_collector.py`)

**Background Task**:
- Run every 5 minutes (via PM2 or cron)
- Fetch latest tweets using Twitter client from Phase 1
- Analyze sentiment using FinBERT
- Store results in Supabase
- Update aggregated sentiment scores

**Pseudocode**:
```python
async def collect_sentiment():
    symbols = ['BTC', 'ETH', 'BNB', 'SOL']
    
    for symbol in symbols:
        # 1. Fetch tweets (Phase 1 client)
        tweets = await twitter_client.search_crypto_tweets(symbol, limit=100)
        
        # 2. Analyze sentiment
        sentiments = sentiment_analyzer.batch_analyze(tweets)
        
        # 3. Store individual results
        await store_individual_sentiments(sentiments)
        
        # 4. Calculate & store aggregate
        agg_score = sentiment_analyzer.aggregate_sentiment(sentiments)
        await store_aggregate_sentiment(symbol, agg_score, len(tweets))
```

---

### 5. **Testing Suite** (`backend/tests/test_sentiment.py`)

**Unit Tests**:
- Test FinBERT model loading
- Test single tweet analysis
- Test batch processing
- Test aggregation logic
- Test time-weighted scoring

**Integration Tests**:
- Test API endpoints
- Test database writes
- Test scheduled job execution

**Mock Data**:
```python
MOCK_TWEETS = [
    {"text": "Bitcoin to the moon! 🚀", "expected": "bullish"},
    {"text": "Market crash incoming, sell now!", "expected": "bearish"},
    {"text": "BTC trading sideways today", "expected": "neutral"}
]
```

---

## 📦 TECHNICAL REQUIREMENTS

### **Dependencies** (`requirements.txt`):
```
transformers==4.35.0
torch==2.1.0
supabase-py>=2.0.0
fastapi>=0.104.0
uvicorn>=0.24.0
```

### **Environment Variables** (`.env`):
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FINBERT_MODEL_PATH=ProsusAI/finbert
```

### **Performance Benchmarks**:
- Model load time: <10s (acceptable on cold start)
- Single tweet analysis: <500ms
- Batch 100 tweets: <30s
- API response time: <1s

---

## 🚨 IMPORTANT NOTES

1. **Model Selection**: Use FinBERT for crypto-specific sentiment. If model too large, fallback to VADER (lightweight).

2. **Rate Limiting**: Respect Supabase quotas. Batch insert tweets (max 1000 at a time).

3. **Error Handling**: 
   - Gracefully handle Twitter API failures
   - Log errors to Sentry
   - Continue processing even if some tweets fail

4. **Data Freshness**: Store timestamp with every analysis. Expire old sentiment after 24h.

5. **Scalability**: Design for 10,000+ tweets/day initially. Should scale to 100k+ later.

---

## ✅ SUCCESS CRITERIA

- [ ] FinBERT model loads successfully
- [ ] Can analyze individual tweets with accuracy >70%
- [ ] Batch processing works for 100+ tweets
- [ ] Database migrations apply without errors
- [ ] API endpoints return correct JSON format
- [ ] Scheduled agent runs every 5 minutes
- [ ] All tests pass (unit + integration)
- [ ] Documentation complete

---

## 🔄 INTEGRATION POINTS

**Phase 1 (Twitter Client)**:
- Import `TwitterSentimentClient` from `src/lib/social/twitter-client.ts`
- Use TypeScript client to fetch tweets, pass to Python backend

**Week 2 (ML Infrastructure)**:
- Similar structure to `backend/ml/feature_engineering.py`
- Reuse Supabase connection patterns
- Follow same RLS security model

**Frontend (Next Phase)**:
- API will be consumed by `src/components/dashboard/SentimentWidget.tsx`
- Real-time updates via Supabase Realtime subscriptions

---

## 📋 EXECUTION CHECKLIST

**Day 1** (Today):
1. Setup Python environment & dependencies
2. Implement `SentimentAnalyzer` class
3. Write unit tests
4. Verify FinBERT model works

**Day 2**:
5. Create database migration
6. Implement FastAPI endpoints
7. Build scheduled agent
8. Integration testing

**Day 3**:
9. Performance optimization
10. Documentation
11. Deploy to production

---

**Target Completion**: 2-3 days  
**Lines of Code Estimate**: 400-500 lines Python

**兵貴神速** - Execute with speed! 🚀

---

**READY TO EXECUTE? YES - Proceed with Phase 2 implementation.**
