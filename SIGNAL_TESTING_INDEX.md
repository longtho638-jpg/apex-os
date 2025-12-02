# 📚 Signal Algorithm Testing - Complete Index

## 🚀 Start Here

| For You | Start With | Time |
|---------|-----------|------|
| Just run tests | `./test_signal_complete.sh` | 10 sec |
| Quick reference | `SIGNAL_TEST_QUICK_START.md` | 2 min |
| Full understanding | `TEST_SIGNAL_ALGORITHM.md` | 15 min |
| Visual learner | `SIGNAL_ALGORITHM_VISUAL.md` | 10 min |
| Gemini CLI user | `GEMINI_SIGNAL_TEST_COMMANDS.md` | 3 min |

---

## 📖 Documentation Files

### 1. **SIGNAL_TEST_QUICK_START.md** ⭐ START HERE
- 1-page quick reference
- 1-command test: `./test_signal_complete.sh`
- Individual test commands
- Expected output
- Troubleshooting

**Use when:** You want to test fast

---

### 2. **TEST_SIGNAL_ALGORITHM.md** 📚 COMPREHENSIVE
- 300+ lines comprehensive guide
- RSI algorithm (formulas + examples)
- MACD algorithm (components + signals)
- Confidence scoring (logic + ranges)
- 4 testing methods:
  1. Unit tests (vitest)
  2. Integration tests (ts-node)
  3. API tests (curl)
  4. Manual verification
- Test vectors (test data)
- Success criteria checklist
- Troubleshooting by issue

**Use when:** You want to understand everything

---

### 3. **SIGNAL_ALGORITHM_VISUAL.md** 🎨 DIAGRAMS
- Algorithm flow chart
- RSI indicator graph
- MACD component diagram
- Confidence scoring levels
- Signal decision tree
- Real-world example (BTC scenario)
- Test case scenarios
- Validation checklist

**Use when:** You learn better with visuals

---

### 4. **GEMINI_SIGNAL_TEST_COMMANDS.md** 🤖 QUICK REF
- 5 main test commands
- Algorithm at a glance
- Expected success indicators
- Quick troubleshooting fixes
- Verification checklist
- Performance metrics

**Use when:** Using Gemini CLI

---

### 5. **SIGNAL_TEST_SUMMARY.txt** 📋 OVERVIEW
- What was created
- Quick start steps
- Algorithm summary
- Expected output
- File locations
- Available commands
- Performance metrics
- Next steps

**Use when:** You want an overview

---

## 🔧 Script Files

### test_signal_complete.sh
Master test runner - runs everything

```bash
./test_signal_complete.sh
```

What it does:
1. Unit tests (vitest) - ~1 sec
2. Seed 50 mock trades - ~2 sec
3. Integration test - ~5 sec
4. Python verification - ~5 sec
5. Display summary

**Total time:** ~10 seconds

---

### backend/scripts/test_signal_algorithm.py
Python verification script - 6 test suites

```bash
python3 backend/scripts/test_signal_algorithm.py
```

Tests:
1. RSI calculation (oversold/overbought)
2. MACD calculation (bullish/bearish)
3. Confidence scoring (0.5-0.9 range)
4. Signal type distribution (BUY/SELL/HOLD)
5. Data integrity (fields, types, nulls)
6. Timestamp validity (recent, format)

---

## 📊 Algorithm Files

### backend/ml/signal-generator.ts
Main algorithm implementation

Classes:
- `SignalGenerator` - main class
  - `calculateRSI(prices, period=14)` - RSI indicator
  - `calculateMACD(prices)` - MACD indicator
  - `calculateEMA(prices, period)` - helper
  - `generateSignal(symbol)` - generate signal
  - `generateAllSignals(symbols)` - batch
  - `saveSignal(signal)` - persist

---

### backend/ml/__tests__/signal-generator.test.ts
Unit tests (vitest) - 12 test cases

Tests:
- calculateRSI: 4 cases
- calculateMACD: 2 cases
- generateSignal: 6 cases

---

### scripts/test-signal-generation.ts
Integration test - 4 symbols

Tests:
- BTC/USDT
- ETH/USDT
- SOL/USDT
- BNB/USDT

---

## 🎯 Testing Methods

### Method 1: One-Command Test (Recommended)
```bash
./test_signal_complete.sh
```
Runs: Unit → Seeds → Integration → Verification

Time: ~10 seconds

---

### Method 2: Unit Tests Only
```bash
npm run test:signals
```
Runs: RSI, MACD, Signal generation

Time: <1 second

---

### Method 3: Integration Test
```bash
npx ts-node scripts/test-signal-generation.ts
```
Runs: Generate signals for 4 symbols

Time: 2-5 seconds

---

### Method 4: Python Verification
```bash
python3 backend/scripts/test_signal_algorithm.py
```
Runs: 6 comprehensive test suites

Time: 3-5 seconds

---

### Method 5: Test Specific Indicator
```bash
vitest -t "calculateRSI"    # RSI only
vitest -t "calculateMACD"   # MACD only
vitest -t "generateSignal"  # Signal gen
```

Time: <1 second each

---

## ✅ Success Criteria

### Unit Tests Pass
- ☑ RSI: 4/4 cases pass
- ☑ MACD: 2/2 cases pass
- ☑ Signal: 6/6 cases pass

### Integration Test Pass
- ☑ Generate 4 signals (BTC, ETH, SOL, BNB)
- ☑ Types: BUY/SELL/HOLD
- ☑ Confidence: 0.5-0.9
- ☑ Indicators: RSI, MACD values

### Python Verification Pass
- ☑ RSI < 30 → BUY
- ☑ RSI > 70 → SELL
- ☑ MACD confirms
- ☑ Confidence correct
- ☑ Signal distribution valid
- ☑ Data integrity valid
- ☑ Timestamps valid

---

## 📍 File Tree

```
apex-os/
├── backend/
│   ├── ml/
│   │   ├── signal-generator.ts ← Algorithm
│   │   └── __tests__/
│   │       └── signal-generator.test.ts ← Unit tests
│   └── scripts/
│       └── test_signal_algorithm.py ← Python verification
│
├── scripts/
│   └── test-signal-generation.ts ← Integration test
│
├── test_signal_complete.sh ← Master runner ⭐
│
└── Documentation/
    ├── SIGNAL_TEST_QUICK_START.md ← 1-page guide ⭐
    ├── TEST_SIGNAL_ALGORITHM.md ← Comprehensive
    ├── SIGNAL_ALGORITHM_VISUAL.md ← Diagrams
    ├── GEMINI_SIGNAL_TEST_COMMANDS.md ← CLI ref
    ├── SIGNAL_TEST_SUMMARY.txt ← Overview
    └── SIGNAL_TESTING_INDEX.md ← This file
```

---

## 🚀 Getting Started

### First Time
1. Read: `SIGNAL_TEST_QUICK_START.md` (2 min)
2. Run: `./test_signal_complete.sh` (10 sec)
3. Done! All tests pass

### If You Want Details
1. Read: `TEST_SIGNAL_ALGORITHM.md` (15 min)
2. Understand: Algorithm flow
3. Study: Test cases
4. Run: `./test_signal_complete.sh`

### If You're Visual Learner
1. Read: `SIGNAL_ALGORITHM_VISUAL.md` (10 min)
2. See: Diagrams and graphs
3. Understand: Decision tree
4. Run tests

---

## 🎓 Algorithm Summary

### RSI (Relative Strength Index)
```
RSI = 100 - (100 / (1 + RS))
RS = AvgGain / AvgLoss (14-period)

Signals:
  RSI < 30  → BUY (oversold)
  RSI > 70  → SELL (overbought)
  30-70     → HOLD (neutral)
```

### MACD (Moving Average Convergence Divergence)
```
MACD = EMA(12) - EMA(26)
Signal = EMA(9) of MACD
Histogram = MACD - Signal

Signals:
  MACD > Signal  → Bullish
  MACD < Signal  → Bearish
```

### Confidence Scoring
```
Base: 0.5
RSI signal: +0.2 (now 0.7)
MACD confirm: +0.2 (now 0.9)
Range: 0.0 - 1.0
```

---

## 🔧 Troubleshooting

| Issue | Solution | Doc |
|-------|----------|-----|
| "Insufficient data" | `python3 backend/scripts/quick_seed.py` | Quick Start |
| "All HOLD" | Normal! Market is neutral | Algo Visual |
| "MACD mismatch" | Use ±0.001 tolerance | Algorithm |
| "DB error" | Check backend/.env | Quick Start |
| "Module not found" | `npm install` | Algorithm |

---

## 📈 Performance

| Test | Duration |
|------|----------|
| Unit tests | < 1 sec |
| Seed data | ~2 sec |
| Integration | 2-5 sec |
| Python verify | 3-5 sec |
| **Total** | **~10 sec** |

---

## ✨ Next Steps

After all tests pass:

1. Deploy to production
2. Monitor signal accuracy (win rate)
3. Tune thresholds if needed
4. Add more indicators (optional)

---

## 📚 Quick Links

| Link | Purpose |
|------|---------|
| [Quick Start](SIGNAL_TEST_QUICK_START.md) | 1-page guide |
| [Comprehensive](TEST_SIGNAL_ALGORITHM.md) | Full details |
| [Visual Guide](SIGNAL_ALGORITHM_VISUAL.md) | Diagrams |
| [CLI Commands](GEMINI_SIGNAL_TEST_COMMANDS.md) | Quick ref |
| [Test Runner](test_signal_complete.sh) | Run tests |

---

**Ready?** Start with: `./test_signal_complete.sh` 🚀
