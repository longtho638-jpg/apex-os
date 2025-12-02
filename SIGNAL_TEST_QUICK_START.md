# ⚡ Quick Start - Test Signal Algorithm

## TL;DR - 1 Command Test

```bash
./test_signal_complete.sh
```

**What it does:**
- ✅ Unit tests (RSI, MACD, Signal generation)
- ✅ Seeds 50 mock trades
- ✅ Runs integration tests
- ✅ Verifies algorithms (6 test suites)
- ✅ Checks API endpoints

**Time:** 2-3 minutes ⏱️

---

## 🎯 What Gets Tested

### Test 1: RSI (Relative Strength Index)
```
✓ Oversold (<30) → BUY signal
✓ Overbought (>70) → SELL signal
✓ Neutral (30-70) → check MACD
```

### Test 2: MACD (Moving Average Convergence Divergence)
```
✓ Bullish crossover (MACD > Signal)
✓ Bearish crossover (MACD < Signal)
✓ Histogram = MACD - Signal (accurate)
```

### Test 3: Confidence Scoring
```
✓ RSI alone: 0.7 (70%)
✓ RSI + MACD: 0.9 (90%)
✓ MACD alone: 0.6 (60%)
✓ Range: 0.0 - 1.0
```

### Test 4: Signal Types
```
✓ BUY/SELL/HOLD distribution
✓ Market condition detection
✓ Appropriate weighting
```

### Test 5: Data Integrity
```
✓ All required fields present
✓ Valid data types
✓ No null values
```

### Test 6: Timestamps
```
✓ ISO format valid
✓ Recent signals (< 1 hour old)
✓ Correct timezone
```

---

## 📊 Expected Output

```
╔════════════════════════════════════════════╗
║ 🧪 SIGNAL ALGORITHM - COMPLETE TEST SUITE ║
╚════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1: Unit Tests
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2: Seed Test Data
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Generating 50 mock trades...
✅ Seeded 50 trades

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3: Integration Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 Testing ML Signal Generation...

📊 Generating signal for BTC/USDT...
   Type: BUY
   Confidence: 80%
   Reason: RSI oversold (28.5), MACD bullish crossover
   RSI: 28.5
   MACD: 0.0045

✅ Signal generation test complete!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4: Comprehensive Algorithm Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEST 1: RSI
   Symbol: BTC/USDT
   RSI: 28.5
   Signal: BUY
   ✓ Correct

TEST 2: MACD
   MACD: 0.004500
   Signal: 0.004000
   Histogram: 0.000500
   ✓ Histogram calculation correct

TEST 3: Confidence Scoring
   ✓ BTC/USDT | Confidence: 0.9 | RSI oversold (28.5), MACD bullish crossover

TEST 4: Signal Type Distribution
   Total signals: 24
   BUY:   8 (33%)
   SELL:  8 (33%)
   HOLD:  8 (33%)

TEST 5: Data Integrity
   ✅ All signals have valid data structure

TEST 6: Timestamp Validity
   ✓ BTC/USDT | Created: 2025-12-02T10:30:15 | Age: 5s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEST SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed: 6
❌ Failed: 0

🎉 All tests passed! Signal algorithm is working correctly.
```

---

## 🔍 Individual Tests

### Just Unit Tests
```bash
npm run test:signals
# or
vitest backend/ml/__tests__/signal-generator.test.ts
```

### Just Integration Test
```bash
npx ts-node scripts/test-signal-generation.ts
```

### Just Python Verification
```bash
python3 backend/scripts/test_signal_algorithm.py
```

### Check Specific Indicator
```bash
# RSI only
vitest -t "calculateRSI"

# MACD only
vitest -t "calculateMACD"

# Signal generation
vitest -t "generateSignal"
```

---

## 🚀 Setup (First Time Only)

```bash
# 1. Install dependencies
npm install

# 2. Setup Python
pip3 install requests python-dotenv

# 3. Configure .env
cp backend/.env.example backend/.env
# Add: SUPABASE_URL, SUPABASE_SERVICE_KEY

# 4. Run once
./test_signal_complete.sh
```

---

## 🎯 Success Criteria

All tests pass ✅ when:

| Test | Criteria | Status |
|------|----------|--------|
| RSI < 30 | BUY signal generated | ✓ |
| RSI > 70 | SELL signal generated | ✓ |
| MACD > Signal | Bullish (BUY boost) | ✓ |
| MACD < Signal | Bearish (SELL boost) | ✓ |
| Confidence | 0.5-0.9 range | ✓ |
| Histogram | MACD - Signal accurate | ✓ |
| Data | All fields present | ✓ |
| Timestamps | Valid & recent | ✓ |

---

## ❌ Troubleshooting

### "Insufficient data"
```bash
# Fix: Seed mock trades
python3 backend/scripts/quick_seed.py
```

### "All signals are HOLD"
```
Normal! Market is neutral.
Run with real market data to see BUY/SELL.
```

### "RSI always 50"
```bash
# Check prices in trade_history
# Should have price variations
SELECT symbol, price FROM trade_history LIMIT 10;
```

### "MACD mismatch"
```
Use ±0.001 tolerance for floats
float_equal(a, b, tolerance=0.001)
```

### "Database connection error"
```bash
# Verify .env
cat backend/.env | grep SUPABASE
# Should show: SUPABASE_URL, SUPABASE_SERVICE_KEY
```

---

## 📁 Test Files

| File | Purpose |
|------|---------|
| `backend/ml/signal-generator.ts` | Algorithm implementation |
| `backend/ml/__tests__/signal-generator.test.ts` | Unit tests (vitest) |
| `scripts/test-signal-generation.ts` | Integration test |
| `backend/scripts/test_signal_algorithm.py` | Python verification |
| `test_signal_complete.sh` | Complete test suite |

---

## 🎓 Algorithm Details

### RSI Formula
```
RSI = 100 - (100 / (1 + RS))
where RS = Average Gain / Average Loss (14-period)
```

### MACD Components
```
MACD = EMA(12) - EMA(26)
Signal = EMA(9) of MACD
Histogram = MACD - Signal
```

### Confidence Logic
```
Base: 0.5
If RSI < 30 or RSI > 70: +0.2
If MACD confirms (bullish/bearish): +0.2
Max: 0.9
```

---

## 🏆 Example Signal Output

```json
{
  "symbol": "BTC/USDT",
  "type": "BUY",
  "reason": "RSI oversold (28.5), MACD bullish crossover",
  "confidence": 0.9,
  "indicators": {
    "rsi": 28.5,
    "macd": {
      "macd": 0.0045,
      "signal": 0.004,
      "histogram": 0.0005
    }
  },
  "timestamp": 1701513000000
}
```

---

## ✨ Next Steps

After all tests pass:

1. **Deploy to production**
   ```bash
   git add .
   git commit -m "feat: add signal algorithm tests"
   git push
   ```

2. **Monitor signal accuracy**
   - Track win rate vs actual trades
   - Compare with paper trading results

3. **Tune thresholds**
   - RSI: 30/70 → adjust if needed
   - MACD: sensitivity tuning

4. **Add more indicators**
   - Bollinger Bands
   - Stochastic
   - Moving averages

---

**Status:** Ready to test! 🚀

Run: `./test_signal_complete.sh`
