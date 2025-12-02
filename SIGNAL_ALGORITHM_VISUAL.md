# 📊 Signal Algorithm - Visual Guide

## Algorithm Flow

```
Market Data (Prices)
        │
        ▼
┌───────────────────┐
│  Calculate RSI    │  (14-period momentum)
│  RSI = 100 - 100/(1+RS)
└────────┬──────────┘
         │
         ├─ RSI < 30  ──┐
         │              │
         ├─ RSI > 70  ──┤
         │              │  Oversold/Overbought
         └─ 30-70    ──┤  (Base: 0.7 confidence)
                        │
         ┌──────────────┘
         │
         ▼
┌───────────────────────┐
│  Calculate MACD       │  (Trend confirmation)
│  MACD = EMA(12)-EMA(26)
│  Signal = EMA(9,MACD)
└────────┬──────────────┘
         │
         ├─ MACD > Signal  ─┐
         │                  │  Bullish/Bearish
         └─ MACD < Signal  ─┤  (+0.2 confidence)
                             │
         ┌───────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Generate Signal             │
│  Type: BUY / SELL / HOLD     │
│  Reason: Indicators + Logic  │
│  Confidence: 0.5 - 0.9       │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Save to Database            │
│  trading_signals table       │
└──────────────────────────────┘
```

---

## RSI Indicator

### What is RSI?
Relative Strength Index measures momentum (0-100):
- **0-30**: Oversold (too low) → **BUY** signal
- **70-100**: Overbought (too high) → **SELL** signal
- **30-70**: Neutral → Wait for MACD

### RSI Formula
```
RSI = 100 - (100 / (1 + RS))

where:
RS = Average Gain (last 14 periods) / Average Loss (last 14 periods)
```

### RSI Graph
```
100  ├─────────────── Overbought (SELL) ─────────────
     │                                         ▁▂▃▅▇█▁▂▃
 70  │─────────────────────────────────────────────────
     │                    ▄▆█▇▆▄▂▁
 50  │─────────────────────────────────────────────────
     │                          ▁▂▄▆█▇▃▂▁
 30  │─────────────── Oversold (BUY) ──────────────────
     │
  0  └─────────────────────────────────────────────────
     Time →
```

### Test Cases
| Prices | RSI | Signal | Confidence |
|--------|-----|--------|------------|
| [100, 99, 98...80] | 5 | BUY | 0.7 |
| [10, 20, 30...100] | 100 | BUY | 0.7 |
| [100, 81, 82...95] | 95 | SELL | 0.7 |
| [50, 50, 50...50] | 50 | HOLD | 0.5 |

---

## MACD Indicator

### What is MACD?
Moving Average Convergence Divergence:
- **MACD Line**: EMA(12) - EMA(26)
- **Signal Line**: EMA(9) of MACD
- **Histogram**: MACD - Signal

### MACD Components
```
Price: 100 ─────┬─────┬─────┬─────┐
              90 │     │     │     │
              80 │     │     │     │
              70 │────┬┘     │     │
              60 │    │      │     │
              50 │    │      │     └─ Price moving up
                 └────┴──────┴────────

EMA(12):  ▁▂▃▅▇█ (faster, follows price)
          ▂▄▆███ (more responsive)

EMA(26):  ▁▁▂▃▄▅ (slower, smoother)
          ▁▂▃▄▅▆ (lags behind price)

MACD = EMA(12) - EMA(26) → Positive when uptrend
Signal = EMA(9, MACD) → Smoothed MACD

Histogram = MACD - Signal
         = Distance between lines
         = Positive = Bullish
         = Negative = Bearish
```

### MACD Graph
```
MACD 0.1  │     ╱╲        ╱╲
     0.05 │    ╱  ╲      ╱  ╲
    0    ├─────────────────────  ← Zero line
   -0.05 │      ╲  ╲    ╱
   -0.1  │       ╲  ╲╱╱╲

Signal   ┼ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (smooth line)

Histogram: ├─┤ ├──┤ ├─┤
          (Vertical bars)
```

### MACD Crossover Signals
```
MACD > Signal  →  Bullish  →  +0.2 confidence (if BUY)
MACD < Signal  →  Bearish  →  +0.2 confidence (if SELL)
```

---

## Confidence Scoring System

### Confidence Levels
```
1.0  │ ████████████████ Maximum (unlikely)
0.9  │ ██████████████▌▌ RSI + MACD confirm
0.8  │ ██████████████
0.7  │ ██████████▌▌    RSI alone
0.6  │ ███████▌▌       MACD alone
0.5  │ ████▌▌          Neutral/HOLD
0.0  │                  No signal
     └─────────────────────────────
```

### Scoring Logic
```
base = 0.5 (neutral)

if RSI < 30:
    type = BUY
    confidence += 0.2  (now 0.7)

if MACD_bullish:
    if type == BUY:
        confidence += 0.2  (now 0.9) ← HIGH CONFIDENCE
    else if type == HOLD:
        type = BUY
        confidence = 0.6

─────────────────────────────────

Example 1: RSI oversold (20) + MACD bullish
Result: BUY, confidence 0.9 (90%) ← STRONG BUY

Example 2: RSI oversold (20) + MACD neutral
Result: BUY, confidence 0.7 (70%) ← WEAK BUY

Example 3: RSI neutral (50) + MACD bullish
Result: BUY, confidence 0.6 (60%) ← MILD BUY

Example 4: RSI neutral (50) + MACD neutral
Result: HOLD, confidence 0.5 (50%) ← UNCERTAIN
```

---

## Signal Decision Tree

```
                    ┌─ Prices ────────┐
                    │   (50 values)    │
                    └────────┬─────────┘
                             │
                    ┌────────▼────────┐
                    │   Calculate     │
                    │      RSI        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
         RSI < 30        30-70 RSI      RSI > 70
              │              │              │
              ▼              ▼              ▼
            BUY           CHECK         SELL
                          MACD
           0.7c            │           0.7c
              │     ┌──────┴──────┐      │
              │     │              │     │
              │  Bullish      Bearish   │
              │  Crsvr        Crsvr     │
              │     │              │     │
              │     ▼              ▼     │
              │   +BUY            HOLD   │
              │   0.6c            0.5c   │
              │     │                    │
              ▼     ▼                    ▼
         ┌─────────────────────────────────┐
         │    Generate Signal              │
         │    Type: BUY/SELL/HOLD         │
         │    Confidence: 0.5-0.9         │
         │    Reason: Indicator text      │
         └─────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Save to Database    │
          │  trading_signals     │
          └──────────────────────┘
```

---

## Real-World Example

### Scenario: Strong Uptrend (BUY Signal)

#### Input: Last 50 prices
```
Time: 1→2→3→4→5→...→48→49→50
Prices: [30, 32, 31, 35, 38, 42, 44, 46, 48, 50,
         52, 55, 58, 60, 63, 65, 68, 70, 72, 75,
         78, 80, 82, 85, 88, 90, 93, 95, 98, 100,
         102, 105, 108, 110, 113, 115, 118, 120,
         122, 125, 128, 130, 133, 135, 138, 140,
         143, 145, 148, 150]

Current Price: 150 (↑ 400% from start)
```

#### Step 1: Calculate RSI
```
Price changes: +2, -1, +4, +3, +4, +2, +2, +2, +2, +3, ...
Gains: [2, 0, 4, 3, 4, 2, 2, 2, 2, 3, ...]
Losses: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, ...]

Avg Gain (14-period): ~3.5
Avg Loss (14-period): ~0.05
RS = 3.5 / 0.05 = 70

RSI = 100 - (100 / (1 + 70)) = 98.6

Result: RSI = 98.6 (OVERBOUGHT!)
```

#### Step 2: Calculate MACD
```
EMA(12) = 145 (faster, high)
EMA(26) = 110 (slower, lagging)
MACD = 145 - 110 = 35

Signal = EMA(9, MACD) = 30
Histogram = 35 - 30 = 5 (POSITIVE)

Result: MACD > Signal (Bullish!)
```

#### Step 3: Generate Signal
```
RSI = 98.6 → SELL signal, confidence = 0.7
MACD > Signal → Bearish crossover? NO!
MACD is POSITIVE (bullish), not crossing below

Actually: RSI overbought suggests PULLBACK coming
         MACD still bullish (momentum strong)
         
Final: SELL signal (0.7) or HOLD (0.5)?
       → Likely SELL due to overbought RSI

Signal: {
  type: "SELL",
  reason: "RSI overbought (98.6)",
  confidence: 0.7,
  indicators: {
    rsi: 98.6,
    macd: { macd: 35, signal: 30, histogram: 5 }
  }
}
```

#### Interpretation
```
This signal says:
  🔴 SELL or TAKE PROFIT
  Reason: Price too high (overbought)
  Confidence: 70% (moderately strong)
  
Although MACD is bullish, the extreme RSI
suggests a pullback or consolidation coming.
```

---

## Example Output

### Signal Card
```
┌────────────────────────────────────┐
│ 📊 TRADING SIGNAL                  │
├────────────────────────────────────┤
│ Symbol: BTC/USDT                   │
│ Type: 🟢 BUY                        │
│ Confidence: ████████░ 80%          │
│                                    │
│ Reason:                            │
│ RSI oversold (25.3)                │
│ MACD bullish crossover             │
│                                    │
│ Indicators:                        │
│ • RSI: 25.3 (Oversold)             │
│ • MACD: 0.0045                     │
│ • Signal: 0.0040                   │
│ • Histogram: 0.0005 (↑)            │
│                                    │
│ Timestamp: 2025-12-02 10:30:15     │
└────────────────────────────────────┘
```

---

## Test Data Examples

### Test 1: Oversold (BUY)
```
Prices: [100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86]
Expected:
  RSI: ~5-15 (Very oversold)
  Signal: BUY
  Confidence: 0.7-0.9
```

### Test 2: Overbought (SELL)
```
Prices: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
Expected:
  RSI: ~90-100 (Very overbought)
  Signal: SELL
  Confidence: 0.7-0.9
```

### Test 3: Neutral (HOLD)
```
Prices: [50, 50.1, 49.9, 50.2, 49.8, 50.1, 49.9, 50, 50.1, 50.2]
Expected:
  RSI: ~45-55 (Neutral)
  MACD: ~0 (Neutral)
  Signal: HOLD
  Confidence: 0.5
```

### Test 4: Bullish with Confirmation
```
Prices: [100, 99, 98, 97, 96, 95, 98, 102, 105, 108, 110, 112, 115]
Expected:
  RSI: ~25 (Oversold)
  MACD: > Signal (Bullish)
  Signal: BUY
  Confidence: 0.9 (HIGH)
```

---

## Validation Checklist

```
✅ RSI Calculation
   □ Range: 0-100
   □ < 30: Oversold
   □ > 70: Overbought
   □ Formula: 100 - 100/(1+RS)

✅ MACD Calculation
   □ MACD = EMA(12) - EMA(26)
   □ Signal = EMA(9) of MACD
   □ Histogram = MACD - Signal (±0.001)

✅ Confidence Scoring
   □ Range: 0.0 - 1.0
   □ RSI alone: 0.7
   □ MACD confirm: +0.2
   □ Max: 0.9

✅ Signal Generation
   □ Type: BUY/SELL/HOLD
   □ Reason: Descriptive
   □ Indicators: Present
   □ Timestamp: Valid

✅ Database
   □ Records saved
   □ Fields correct
   □ No nulls
   □ Timestamps valid
```

---

**Now you understand the algorithm! Ready to test?** 🚀

Run: `./test_signal_complete.sh`
