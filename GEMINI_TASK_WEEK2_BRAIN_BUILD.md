# 🧠 GEMINI TASK: WEEK 2 BRAIN BUILD SPRINT

**Priority**: CRITICAL (AI Alpha = Premium Tier Value)  
**Complexity**: HIGH (ML + Real-time Data Pipeline)  
**Timeline**: 7 days  
**Principle**: 不積跬步，無以至千里 - No technical debt, production-grade from day 1

---

## ⚠️ CRITICAL REQUIREMENTS

> [!CAUTION]
> **This task involves REAL TRADING DECISIONS that affect user money.**
> - All predictions must be logged and auditable
> - No black-box models without explainability
> - Test coverage >90% for critical paths
> - Rate limits on all external APIs
> - Graceful degradation if AI fails

> [!IMPORTANT]
> **Zero Technical Debt Policy:**
> - Write tests FIRST for financial logic
> - Document all assumptions
> - Use TypeScript strict mode
> - No `any` types in production code
> - All database operations must be atomic

---

## 📋 TASK OVERVIEW

### **Objective**:
Build complete AI trading infrastructure for signals, arbitrage detection, and predictive analytics.

### **What Success Looks Like**:
1. ✅ Historical data pipeline running (BTC, ETH, BNB)
2. ✅ ML model trained with >60% accuracy
3. ✅ Signal execution engine with paper trading validation
4. ✅ Frontend dashboard showing predictions
5. ✅ Zero downtime during data collection
6. ✅ All code covered by tests

---

## 🏗️ IMPLEMENTATION PHASES

### **Phase 1: Data Pipeline** (Days 1-2)

**Goal**: Robust, fault-tolerant data collection pipeline

#### **1.1 Binance API Client Enhancement**

**File**: `src/lib/binance/client.ts`

**Requirements**:
- Rate limiting (1200 requests/minute for Binance)
- Automatic retry with exponential backoff
- Error categorization (rate limit vs network vs auth)
- Request queuing to prevent burst errors
- Websocket fallback for real-time data

**Implementation**:
```typescript
// src/lib/binance/client.ts
import Bottleneck from 'bottleneck';
import axios, { AxiosError } from 'axios';

interface BinanceConfig {
  apiKey?: string;
  secretKey?: string;
  testnet?: boolean;
}

class BinanceClient {
  private limiter: Bottleneck;
  private baseUrl: string;
  
  constructor(config: BinanceConfig = {}) {
    // Binance rate limit: 1200 requests/minute = 20/second
    this.limiter = new Bottleneck({
      reservoir: 1200,
      reservoirRefreshAmount: 1200,
      reservoirRefreshInterval: 60 * 1000, // 1 minute
      maxConcurrent: 5,
      minTime: 50 // 50ms between requests
    });
    
    this.baseUrl = config.testnet 
      ? 'https://testnet.binance.vision/api'
      : 'https://api.binance.com/api';
  }
  
  async getKlines(params: {
    symbol: string;
    interval: string;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }) {
    return this.limiter.schedule(() => this.executeRequest('/v3/klines', params));
  }
  
  private async executeRequest(endpoint: string, params: any, retries = 3) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params,
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (this.isRetryable(error) && retries > 0) {
        const delay = Math.pow(2, 4 - retries) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeRequest(endpoint, params, retries - 1);
      }
      throw this.categorizeError(error);
    }
  }
  
  private isRetryable(error: any): boolean {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) return true; // Rate limit
    if (axiosError.code === 'ECONNRESET') return true; // Network
    if (axiosError.code === 'ETIMEDOUT') return true; // Timeout
    return false;
  }
  
  private categorizeError(error: any): Error {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 429) {
      return new Error('RATE_LIMIT_EXCEEDED');
    }
    if (axiosError.response?.status === 401) {
      return new Error('AUTH_FAILED');
    }
    return new Error(`BINANCE_ERROR: ${error.message}`);
  }
}

export const binanceClient = new BinanceClient({
  apiKey: process.env.BINANCE_API_KEY,
  secretKey: process.env.BINANCE_SECRET,
  testnet: process.env.NODE_ENV !== 'production'
});
```

**Tests** (`src/__tests__/lib/binance/client.test.ts`):
```typescript
describe('BinanceClient', () => {
  it('should respect rate limits', async () => {
    // Send 25 requests rapidly, should not error
  });
  
  it('should retry on network errors', async () => {
    // Mock network failure, verify retry
  });
  
  it('should categorize errors correctly', async () => {
    // Mock 429 → expect RATE_LIMIT_EXCEEDED
  });
});
```

---

#### **1.2 Data Collection Agent**

**File**: `backend/agents/data_collection_agent.py`

**Requirements**:
- Collect OHLCV data for BTC, ETH, BNB (1m, 5m, 15m, 1h, 4h, 1d intervals)
- Backfill historical data (last 90 days)
- Real-time incremental updates
- Detect and handle missing data
- Store in Supabase with deduplication

**Database Schema**:
```sql
-- Migration: supabase/migrations/20251127_market_data.sql

CREATE TABLE IF NOT EXISTS market_data_ohlcv (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  interval VARCHAR(5) NOT NULL,
  open_time TIMESTAMPTZ NOT NULL,
  open DECIMAL(20, 8) NOT NULL,
  high DECIMAL(20, 8) NOT NULL,
  low DECIMAL(20, 8) NOT NULL,
  close DECIMAL(20, 8) NOT NULL,
  volume DECIMAL(20, 8) NOT NULL,
  close_time TIMESTAMPTZ NOT NULL,
  quote_volume DECIMAL(20, 8),
  trades INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(symbol, interval, open_time) -- Prevent duplicates
);

CREATE INDEX idx_ohlcv_symbol_interval ON market_data_ohlcv(symbol, interval);
CREATE INDEX idx_ohlcv_open_time ON market_data_ohlcv(open_time DESC);

-- Materialized view for latest prices (fast queries)
CREATE MATERIALIZED VIEW latest_prices AS
SELECT DISTINCT ON (symbol, interval)
  symbol,
  interval,
  close as price,
  volume,
  open_time
FROM market_data_ohlcv
ORDER BY symbol, interval, open_time DESC;

CREATE UNIQUE INDEX idx_latest_prices ON latest_prices(symbol, interval);
```

**Implementation**:
```python
# backend/agents/data_collection_agent.py
import asyncio
from datetime import datetime, timedelta
from supabase import create_client
import os

class DataCollectionAgent:
    def __init__(self):
        self.supabase = create_client(
            os.getenv('NEXT_PUBLIC_SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        )
        self.symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']
        self.intervals = ['1m', '5m', '15m', '1h', '4h', '1d']
    
    async def backfill_historical(self, days=90):
        """Backfill last 90 days of data"""
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)
        
        for symbol in self.symbols:
            for interval in self.intervals:
                print(f"Backfilling {symbol} {interval}...")
                await self.fetch_and_store(symbol, interval, start_time, end_time)
    
    async def fetch_and_store(self, symbol, interval, start_time, end_time):
        """Fetch from Binance and store in Supabase"""
        # Call Binance API (use client.ts via subprocess or direct API)
        klines = await self.fetch_klines(symbol, interval, start_time, end_time)
        
        # Transform to database format
        records = []
        for kline in klines:
            records.append({
                'symbol': symbol,
                'interval': interval,
                'open_time': datetime.fromtimestamp(kline[0] / 1000),
                'open': float(kline[1]),
                'high': float(kline[2]),
                'low': float(kline[3]),
                'close': float(kline[4]),
                'volume': float(kline[5]),
                'close_time': datetime.fromtimestamp(kline[6] / 1000),
                'quote_volume': float(kline[7]),
                'trades': int(kline[8])
            })
        
        # Upsert (handle duplicates via UNIQUE constraint)
        self.supabase.table('market_data_ohlcv').upsert(
            records,
            on_conflict='symbol,interval,open_time'
        ).execute()
        
        print(f"Stored {len(records)} records for {symbol} {interval}")
    
    async def run_realtime_collection(self):
        """Continuous collection (run as cron every 1 minute)"""
        while True:
            for symbol in self.symbols:
                # Collect 1m data (most granular)
                await self.fetch_and_store(
                    symbol, 
                    '1m', 
                    datetime.now() - timedelta(minutes=2),
                    datetime.now()
                )
            
            # Refresh materialized view
            self.supabase.rpc('refresh_latest_prices').execute()
            
            await asyncio.sleep(60)  # Wait 1 minute

if __name__ == '__main__':
    agent = DataCollectionAgent()
    
    # First run: Backfill
    if '--backfill' in sys.argv:
        asyncio.run(agent.backfill_historical(days=90))
    
    # Continuous: Real-time
    else:
        asyncio.run(agent.run_realtime_collection())
```

**Cron Setup** (`crontab or Vercel Cron`):
```bash
# Every minute: collect latest data
*/1 * * * * cd /Users/macbookprom1/apex-os/backend/agents && python data_collection_agent.py

# Every hour: refresh materialized view
0 * * * * psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY latest_prices;"
```

**Tests**:
```python
# backend/agents/test_data_collection.py
def test_backfill_handles_duplicates():
    # Run backfill twice, verify no duplicate errors
    pass

def test_realtime_collection_graceful_failure():
    # Mock Binance API failure, verify retry
    pass

def test_data_quality():
    # Verify no gaps in time series
    # Verify OHLCV constraints (high >= low, etc.)
    pass
```

---

### **Phase 2: ML Model Training** (Days 3-4)

**Goal**: Train "Opportunity Detector" model with explainable features

#### **2.1 Feature Engineering**

**File**: `backend/ml/features.py`

**Requirements**:
- Technical indicators (RSI, MACD, Bollinger Bands)
- Volume analysis (OBV, VWAP)
- Market microstructure (bid-ask spread, order book imbalance)
- Sentiment features (placeholder for now)
- All features normalized and windowed

**Implementation**:
```python
# backend/ml/features.py
import pandas as pd
import numpy as np
from ta.trend import MACD
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands

class FeatureEngineer:
    def __init__(self):
        self.feature_columns = []
    
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Create ML features from OHLCV data
        
        Args:
            df: DataFrame with columns [open, high, low, close, volume]
        
        Returns:
            DataFrame with added feature columns
        """
        # Technical Indicators
        df['rsi_14'] = RSIIndicator(close=df['close'], window=14).rsi()
        
        macd = MACD(close=df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_diff'] = macd.macd_diff()
        
        bb = BollingerBands(close=df['close'])
        df['bb_high'] = bb.bollinger_hband()
        df['bb_low'] = bb.bollinger_lband()
        df['bb_mid'] = bb.bollinger_mavg()
        df['bb_width'] = (df['bb_high'] - df['bb_low']) / df['bb_mid']
        
        # Price Action
        df['returns'] = df['close'].pct_change()
        df['log_returns'] = np.log(df['close'] / df['close'].shift(1))
        df['high_low_ratio'] = df['high'] / df['low']
        
        # Volume
        df['volume_sma_20'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma_20']
        
        # Price vs Moving Averages
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()
        df['price_sma20_ratio'] = df['close'] / df['sma_20']
        df['price_sma50_ratio'] = df['close'] / df['sma_50']
        
        # Volatility
        df['volatility_20'] = df['returns'].rolling(window=20).std()
        
        # Target: Predict if price will increase >1% in next hour
        df['target'] = (df['close'].shift(-12) > df['close'] * 1.01).astype(int)
        # 12 periods = 1 hour for 5m interval
        
        # Drop NaN rows
        df = df.dropna()
        
        self.feature_columns = [
            'rsi_14', 'macd', 'macd_signal', 'macd_diff',
            'bb_width', 'returns', 'log_returns', 'high_low_ratio',
            'volume_ratio', 'price_sma20_ratio', 'price_sma50_ratio',
            'volatility_20'
        ]
        
        return df
    
    def get_feature_importance(self, model):
        """Get feature importance for explainability"""
        importances = model.feature_importances_
        return pd.DataFrame({
            'feature': self.feature_columns,
            'importance': importances
        }).sort_values('importance', ascending=False)
```

---

#### **2.2 Model Training**

**File**: `backend/ml/opportunity_detector.py`

**Requirements**:
- Gradient Boosting (XGBoost or LightGBM)
- Train/validation/test split (60/20/20)
- Cross-validation for robustness
- Hyperparameter tuning
- Model versioning
- Explainability (SHAP values)

**Implementation**:
```python
# backend/ml/opportunity_detector.py
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import shap

class OpportunityDetector:
    def __init__(self):
        self.model = None
        self.feature_engineer = FeatureEngineer()
        self.version = '1.0.0'
    
    def train(self, df: pd.DataFrame):
        """Train model on historical data"""
        # Create features
        df = self.feature_engineer.create_features(df)
        
        # Split data
        X = df[self.feature_engineer.feature_columns]
        y = df['target']
        
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=0.4, random_state=42, stratify=y
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.5, random_state=42, stratify=y_temp
        )
        
        # Train XGBoost
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric='logloss'
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            early_stopping_rounds=10,
            verbose=False
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        print(f"Model Performance:")
        print(f"  Accuracy:  {accuracy:.2%}")
        print(f"  Precision: {precision:.2%}")
        print(f"  Recall:    {recall:.2%}")
        print(f"  F1 Score:  {f1:.2%}")
        
        # Feature importance
        importance = self.feature_engineer.get_feature_importance(self.model)
        print("\nTop Features:")
        print(importance.head(5))
        
        # SHAP explainability (for production)
        explainer = shap.TreeExplainer(self.model)
        shap_values = explainer.shap_values(X_test[:100])
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'feature_importance': importance.to_dict()
        }
    
    def predict(self, df: pd.DataFrame):
        """Predict opportunities on new data"""
        if self.model is None:
            self.load_model()
        
        df = self.feature_engineer.create_features(df)
        X = df[self.feature_engineer.feature_columns]
        
        probabilities = self.model.predict_proba(X)
        predictions = self.model.predict(X)
        
        return {
            'predictions': predictions,
            'probabilities': probabilities[:, 1],  # Probability of positive class
            'features': X
        }
    
    def save_model(self):
        """Save model with versioning"""
        model_path = f'backend/ml/models/opportunity_detector_v{self.version}.pkl'
        joblib.dump({
            'model': self.model,
            'feature_engineer': self.feature_engineer,
            'version': self.version
        }, model_path)
        print(f"Model saved: {model_path}")
    
    def load_model(self):
        """Load latest model"""
        model_path = f'backend/ml/models/opportunity_detector_v{self.version}.pkl'
        data = joblib.load(model_path)
        self.model = data['model']
        self.feature_engineer = data['feature_engineer']
```

**Training Script**:
```python
# backend/ml/train.py
from opportunity_detector import OpportunityDetector
from supabase import create_client

def train_opportunity_detector():
    # Load data from Supabase
    supabase = create_client(...)
    data = supabase.table('market_data_ohlcv')\
        .select('*')\
        .eq('symbol', 'BTCUSDT')\
        .eq('interval', '5m')\
        .order('open_time')\
        .execute()
    
    df = pd.DataFrame(data.data)
    
    # Train
    detector = OpportunityDetector()
    metrics = detector.train(df)
    
    print(f"\nTraining complete: {metrics}")

if __name__ == '__main__':
    train_opportunity_detector()
```

---

### **Phase 3: Signal Execution Engine** (Days 5-6)

**Goal**: Real-time signal generation and paper trading validation

#### **3.1 Signal Generator Service**

**File**: `src/lib/ai/signal-generator.ts`

**Requirements**:
- Load ML model predictions
- Generate actionable signals (BUY/SELL/HOLD)
- Risk management (position sizing, stop loss)
- Signal confidence scoring
- Rate limiting (max 10 signals/hour per user)

**Implementation**:
```typescript
// src/lib/ai/signal-generator.ts
import { getSupabaseClient } from '@/lib/supabase';

interface Signal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  reasoning: string;
  created_at: Date;
}

export class SignalGenerator {
  private supabase = getSupabaseClient();
  
  async generateSignals(userId: string): Promise<Signal[]> {
    // 1. Get latest market data
    const { data: latestPrices } = await this.supabase
      .from('latest_prices')
      .select('*')
      .in('symbol', ['BTCUSDT', 'ETHUSDT', 'BNBUSDT']);
    
    // 2. Call Python ML service (via subprocess or API)
    const predictions = await this.callMLModel(latestPrices);
    
    // 3. Convert predictions to signals
    const signals: Signal[] = [];
    
    for (const pred of predictions) {
      if (pred.probability > 0.7) { // High confidence threshold
        const signal: Signal = {
          id: uuidv4(),
          symbol: pred.symbol,
          direction: pred.prediction === 1 ? 'BUY' : 'SELL',
          confidence: pred.probability,
          entry_price: pred.current_price,
          stop_loss: pred.current_price * 0.98, // 2% stop loss
          take_profit: pred.current_price * 1.05, // 5% take profit
          reasoning: this.generateReasoning(pred.features),
          created_at: new Date()
        };
        
        signals.push(signal);
      }
    }
    
    // 4. Store signals
    await this.supabase.table('ai_signals').insert(signals);
    
    // 5. Notify user (if subscribed to PRO tier)
    await this.notifyUser(userId, signals);
    
    return signals;
  }
  
  private async callMLModel(marketData: any[]) {
    // Call Python service (FastAPI endpoint)
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ market_data: marketData })
    });
    
    return response.json();
  }
  
  private generateReasoning(features: any): string {
    // Use top features to explain signal
    const topFeatures = Object.entries(features)
      .sort(([,a], [,b]) => Math.abs(b as number) - Math.abs(a as number))
      .slice(0, 3);
    
    return `Signal based on: ${topFeatures.map(([k,v]) => `${k}=${v}`).join(', ')}`;
  }
}
```

**Database Schema**:
```sql
-- Migration: supabase/migrations/20251127_ai_signals.sql

CREATE TABLE IF NOT EXISTS ai_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  confidence DECIMAL(3, 2) NOT NULL,
  entry_price DECIMAL(20, 8) NOT NULL,
  stop_loss DECIMAL(20, 8),
  take_profit DECIMAL(20, 8),
  reasoning TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, executed, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX idx_ai_signals_user_status ON ai_signals(user_id, status);
CREATE INDEX idx_ai_signals_created ON ai_signals(created_at DESC);
```

---

#### **3.2 Paper Trading Validation**

**File**: `src/lib/paper-trading/executor.ts`

**Requirements**:
- Execute signals in paper trading mode
- Track P&L  
- Validate model accuracy
- Alert on anomalies

**Implementation**:
```typescript
// src/lib/paper-trading/executor.ts
export class PaperTradingExecutor {
  async executeSignal(signal: Signal) {
    // Create paper trade
    const trade = await this.supabase.table('paper_trades').insert({
      user_id: signal.user_id,
      signal_id: signal.id,
      symbol: signal.symbol,
      direction: signal.direction,
      entry_price: signal.entry_price,
      quantity: this.calculatePositionSize(signal),
      status: 'open'
    });
    
    // Monitor for exit conditions
    this.monitorTrade(trade.id);
  }
  
  private async monitorTrade(tradeId: string) {
    // Check every minute if stop loss or take profit hit
    // Update paper_trades table with result
  }
}
```

---

### **Phase 4: Frontend Integration** (Day 7)

**Goal**: User-facing AI dashboard

#### **4.1 AI Signals Component**

**File**: `src/components/dashboard/AISignals.tsx`

**Requirements**:
- Display active signals
- Show confidence scores
- Enable 1-click copy to clipboard
- Real-time updates via Supabase Realtime

**Implementation**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function AISignals({ userId }: { userId: string }) {
  const [signals, setSignals] = useState([]);
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    // Subscribe to new signals
    const channel = supabase
      .channel('ai_signals')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_signals',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setSignals(prev => [payload.new, ...prev]);
        toast.success('New AI Signal!');
      })
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  return (
    <div className="ai-signals">
      <h2>🤖 AI Trading Signals</h2>
      {signals.map(signal => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
    </div>
  );
}
```

---

## ✅ DELIVERABLES CHECKLIST

### **Code**:
- [ ] `src/lib/binance/client.ts` - Enhanced API client with rate limiting
- [ ] `backend/agents/data_collection_agent.py` - Data pipeline
- [ ] `backend/ml/features.py` - Feature engineering
- [ ] `backend/ml/opportunity_detector.py` - ML model
- [ ] `src/lib/ai/signal-generator.ts` - Signal generation
- [ ] `src/lib/paper-trading/executor.ts` - Paper trading
- [ ] `src/components/dashboard/AISignals.tsx` - Frontend component

### **Database**:
- [ ] `supabase/migrations/20251127_market_data.sql` - OHLCV schema
- [ ] `supabase/migrations/20251127_ai_signals.sql` - Signals schema

### **Tests**:
- [ ] `src/__tests__/lib/binance/client.test.ts` - API client (>90% coverage)
- [ ] `backend/agents/test_data_collection.py` - Data pipeline
- [ ] `backend/ml/test_model.py` - ML model validation

### **Documentation**:
- [ ] `docs/AI_ARCHITECTURE.md` - System architecture
- [ ] `docs/DATA_PIPELINE.md` - Data collection guide
- [ ] `docs/MODEL_TRAINING.md` - Training procedures
- [ ] `README_WEEK2.md` - Week 2 summary

---

## 🔒 SECURITY CHECKLIST

- [ ] Binance API keys stored in Vercel env (never in code)
- [ ] Rate limiting on all external APIs
- [ ] Input validation on all ML predictions
- [ ] Supabase RLS policies on ai_signals table
- [ ] Paper trading mode default (real trading requires explicit flag)
- [ ] Anomaly detection (alert if signal accuracy <50%)

---

## 🧪 TESTING REQUIREMENTS

### **Unit Tests** (>90% coverage):
- [ ] Binance client handles rate limits
- [ ] Feature engineering produces valid data
- [ ] Model predictions within expected range

### **Integration Tests**:
- [ ] End-to-end: Data collection → ML prediction → Signal generation
- [ ] Paper trading executor tracks P&L correctly
- [ ] Frontend receives real-time signals

### **Performance Tests**:
- [ ] Data pipeline handles 1000 requests/minute
- [ ] ML inference <100ms per prediction
- [ ] Signal generation <1 second end-to-end

---

## 📊 SUCCESS METRICS

**After Week 2**:
- ✅ 90 days of historical data collected (BTC, ETH, BNB)
- ✅ ML model trained with >60% accuracy
- ✅ 10+ signals generated daily
- ✅ Paper trading tracking 100+ trades
- ✅ Frontend dashboard live
- ✅ Zero production errors (monitored via Sentry)

---

## ⚠️ IF BLOCKED

**Data collection fails**: 
- Fallback to public APIs (CoinGecko, CryptoCompare)
- Use cached data for development

**ML accuracy <60%**:
- Reduce features (prevent overfitting)
- Increase training data
- Try different model (LightGBM vs XGBoost)

**Frontend performance issues**:
- Implement virtual scrolling for signal list
- Paginate historical signals

---

## 🎯 FINAL VERIFICATION

Before marking complete:
1. Run full test suite: `npm test && pytest`
2. Deploy to staging: `git push origin staging`
3. Smoke test: Generate 1 signal, verify it appears in UI
4. Check Sentry: Zero errors in last 24h
5. Review code coverage: All files >90%

---

**Principle**: 勝兵先勝而後求戰 - Win first, then fight.  
**Zero technical debt. Production-grade from day 1.**

**Ready to execute! 🚀💎⚔️**
