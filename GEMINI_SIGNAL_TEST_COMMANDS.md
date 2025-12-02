# 🤖 Gemini CLI - Signal Algorithm Test Commands

## Quick Commands for Gemini

### 1️⃣ One-Command Test (Everything)
```bash
./test_signal_complete.sh
```

### 2️⃣ Unit Tests Only
```bash
npm run test:signals
```

### 3️⃣ Integration Test
```bash
npx ts-node scripts/test-signal-generation.ts
```

### 4️⃣ Comprehensive Verification
```bash
python3 backend/scripts/test_signal_algorithm.py
```

### 5️⃣ Test Specific Indicator
```bash
# RSI calculation
vitest -t "calculateRSI"

# MACD calculation
vitest -t "calculateMACD"

# Signal generation
vitest -t "generateSignal"
```

---

## What Each Test Does

### Unit Tests (vitest) - 12 test cases
```
✓ calculateRSI - 4 cases
  • Returns 50 for insufficient data
  • Returns 100 for no losses (uptrend)
  • Calculates correctly for normal data
  • Calculates correctly for downtrend

✓ calculateMACD - 2 cases
  • Simple trend calculation
  • Known data verification

✓ generateSignal - 6 cases
  • HOLD for insufficient data
  • BUY for oversold RSI
  • SELL for overbought RSI
  • Confidence adjustment with MACD
  • Save to database
  • Error handling
```

### Integration Test - 4 symbols
```
BTC/USDT → BUY (80% confidence)
ETH/USDT → SELL (70% confidence)
SOL/USDT → HOLD (50% confidence)
BNB/USDT → BUY (85% confidence)
```

### Python Verification - 6 test suites
```
1. RSI calculation (oversold/overbought)
2. MACD calculation (bullish/bearish)
3. Confidence scoring (0.5-0.9 range)
4. Signal distribution (BUY/SELL/HOLD)
5. Data integrity (fields, types, nulls)
6. Timestamp validity (recent, correct format)
```

---

## Expected Success Indicators

### ✅ All tests PASS when:
```
Unit Tests:
  PASSED: calculateRSI (4/4)
  PASSED: calculateMACD (2/2)
  PASSED: generateSignal (6/6)

Integration:
  ✓ All 4 symbols generated signals
  ✓ Types are BUY/SELL/HOLD
  ✓ Confidence 0.5-0.9
  ✓ Indicators present

Python:
  ✓ RSI < 30 → BUY
  ✓ RSI > 70 → SELL
  ✓ MACD confirms (bullish/bearish)
  ✓ Confidence correct
  ✓ 33% BUY, 33% SELL, 33% HOLD
  ✓ All fields valid
  ✓ Timestamps recent
```

---

## Algorithm at a Glance

### RSI (Relative Strength Index)
```
Formula: RSI = 100 - (100 / (1 + RS))
Where: RS = AvgGain / AvgLoss (14-period)

Signals:
  RSI < 30   → BUY (oversold)
  RSI > 70   → SELL (overbought)
  30-70      → HOLD (neutral)
```

### MACD (Moving Average Convergence Divergence)
```
MACD = EMA(12) - EMA(26)
Signal = EMA(9) of MACD
Histogram = MACD - Signal

Signals:
  MACD > Signal  → Bullish (+0.2 confidence)
  MACD < Signal  → Bearish (+0.2 confidence)
```

### Confidence Scoring
```
Base: 0.5 (neutral)
RSI signal: +0.2 (0.7 total)
MACD confirm: +0.2 (0.9 total)
Range: 0.0 - 1.0
```

---

## Test Files Location

```
Algorithm:
  backend/ml/signal-generator.ts

Tests:
  backend/ml/__tests__/signal-generator.test.ts
  scripts/test-signal-generation.ts
  backend/scripts/test_signal_algorithm.py

Test Runner:
  test_signal_complete.sh

Documentation:
  TEST_SIGNAL_ALGORITHM.md (detailed guide)
  SIGNAL_TEST_QUICK_START.md (quick reference)
  SIGNAL_ALGORITHM_VISUAL.md (diagrams)
```

---

## Troubleshooting Quick Fix

### Error: "Insufficient data"
```bash
# Seed mock trades
python3 backend/scripts/quick_seed.py
```

### Error: "Cannot find module"
```bash
# Install dependencies
npm install
pip3 install requests python-dotenv
```

### Error: "Database connection"
```bash
# Check .env
cat backend/.env | grep SUPABASE
# Should show SUPABASE_URL and SUPABASE_SERVICE_KEY
```

### All signals are HOLD
```
This is normal! Market is neutral.
Trade data needs price variations.
Run: python3 backend/scripts/quick_seed.py
```

---

## Verification Checklist

After running tests, verify:

- [ ] Unit tests pass (12/12)
- [ ] Integration test generates 4 signals
- [ ] RSI < 30 generates BUY signal
- [ ] RSI > 70 generates SELL signal
- [ ] MACD bullish increases confidence to 0.9
- [ ] Histogram = MACD - Signal (±0.001)
- [ ] All signals in database have valid data
- [ ] Timestamps are recent (<1 hour old)
- [ ] Signal types are BUY/SELL/HOLD only
- [ ] Confidence between 0.5-0.9

---

## Performance Metrics

```
Unit Tests:      < 1 second
Integration:     2-5 seconds
Python Verify:   3-5 seconds
Database Check:  1-2 seconds
─────────────────────────────
Total Time:      ~10 seconds
```

---

## Next Steps

1. Run tests
2. Verify all pass
3. Check database for signals
4. Deploy to production
5. Monitor signal accuracy (win rate)
6. Tune thresholds if needed
7. Add more indicators (optional)

---

## Advanced: Run Specific Test

```bash
# RSI only
npm run test:signals -- -t "calculateRSI"

# MACD only
npm run test:signals -- -t "calculateMACD"

# BUY signals only
npm run test:signals -- -t "generateSignal"

# Specific symbol (integration)
npx ts-node scripts/test-signal-generation.ts -- BTC
```

---

## Summary

| Test | Command | Duration | Output |
|------|---------|----------|--------|
| All Tests | `./test_signal_complete.sh` | ~10s | Summary |
| Unit | `npm run test:signals` | <1s | PASS/FAIL |
| Integration | `npx ts-node scripts/test-signal-generation.ts` | 5s | 4 signals |
| Verification | `python3 backend/scripts/test_signal_algorithm.py` | 5s | 6 reports |

---

**Ready?** Start with: `./test_signal_complete.sh`
