# 🧪 TEST THUẬT TOÁN TÍN HIỆU (Signal Algorithm)

## 📊 Thuật Toán Có Gì?

Apex OS dùng **3 thuật toán chính**:

1. **RSI (Relative Strength Index)** - 14-period
   - Phát hiện: Oversold (<30) → BUY, Overbought (>70) → SELL
   
2. **MACD (Moving Average Convergence Divergence)**
   - EMA 12 & 26, Signal line 9-period
   - Bullish crossover: Macd > Signal
   - Bearish crossover: Macd < Signal

3. **Confidence Scoring**
   - Base: 0.5 (neutral)
   - RSI: +0.2 (70% confidence)
   - MACD confirmation: +0.2 (up to 90% confidence)

---

## ✅ CÁCH 1: Unit Test (Kiểm tra lý thuyết)

### Chạy tất cả test:
```bash
npm run test:signals
# hoặc
vitest backend/ml/__tests__/signal-generator.test.ts
```

### Test cụ thể:

```bash
# Test RSI calculation
vitest -t "calculateRSI"

# Test MACD calculation
vitest -t "calculateMACD"

# Test signal generation
vitest -t "generateSignal"

# Test error handling
vitest -t "handle errors"
```

### Kiểm tra gì:

✅ **RSI Tests:**
- Trả về 50 nếu dữ liệu không đủ (<15 giá)
- Trả về 100 khi không có losses (uptrend hoàn toàn)
- Tính đúng RSI với dữ liệu standard
- Tính đúng RSI khi downtrend

✅ **MACD Tests:**
- Tính đúng cho uptrend
- Tính đúng cho downtrend
- MACD, Signal, Histogram chính xác

✅ **Signal Generation Tests:**
- BUY signal khi RSI oversold (20)
- SELL signal khi RSI overbought (80)
- MACD bullish crossover + RSI oversold → confidence 90%
- Save signal to database
- Error handling gracefully

---

## ✅ CÁCH 2: Integration Test (Kiểm tra thực tế)

### Setup:

```bash
# 1. Seed mock market data
python3 backend/scripts/quick_seed.py

# 2. Start backend
npm run dev
```

### Chạy test signal:

```bash
# TypeScript test script
npx ts-node scripts/test-signal-generation.ts

# Hoặc chạy qua Node
node -r ts-node/register scripts/test-signal-generation.ts
```

### Output mong đợi:

```
🧪 Testing ML Signal Generation...

📊 Generating signal for BTC/USDT...
   Type: BUY
   Confidence: 80%
   Reason: RSI oversold (28.5), MACD bullish crossover
   RSI: 28.5
   MACD: 0.0045
   Signal: 0.0040
   Histogram: 0.0005

📊 Generating signal for ETH/USDT...
   Type: SELL
   Confidence: 70%
   Reason: RSI overbought (75.2)
   RSI: 75.2
   MACD: -0.0023
   Signal: -0.0020
   Histogram: -0.0003

✅ Signal generation test complete!
```

---

## ✅ CÁCH 3: API Test (Kiểm tra end-to-end)

### 1. Xem tín hiệu được tạo:

```bash
# Lấy signals từ database
curl "http://localhost:3000/api/v1/signals" \
  -H "Authorization: Bearer YOUR_JWT"
```

### 2. Response mong đợi:

```json
{
  "signals": [
    {
      "id": "sig-001",
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
      "created_at": "2025-12-02T10:30:00Z"
    }
  ]
}
```

### 3. Test cụ thể từng indicator:

```bash
# Chỉ lấy BUY signals
curl "http://localhost:3000/api/v1/signals?type=BUY"

# Chỉ lấy high-confidence (>0.8)
curl "http://localhost:3000/api/v1/signals?confidence=0.8"

# Chỉ BTC
curl "http://localhost:3000/api/v1/signals?symbol=BTC/USDT"
```

---

## ✅ CÁCH 4: Manual Verification (Kiểm tra bằng tay)

### Bước 1: Tạo test data

```bash
# Seed 50 realistic trades
python3 backend/scripts/quick_seed.py
```

### Bước 2: Check database

```sql
-- View trading_signals table
SELECT 
  symbol,
  signal_type,
  reason,
  confidence,
  indicators,
  created_at
FROM trading_signals
ORDER BY created_at DESC
LIMIT 10;
```

### Bước 3: Verify mỗi signal

Cho mỗi signal, check:

**RSI:**
- [ ] Nếu RSI < 30 → type phải BUY
- [ ] Nếu RSI > 70 → type phải SELL
- [ ] Nếu 30 ≤ RSI ≤ 70 → phải có MACD confirmation

**MACD:**
- [ ] Nếu MACD > Signal → bullish
- [ ] Nếu MACD < Signal → bearish
- [ ] Histogram = MACD - Signal

**Confidence:**
- [ ] RSI alone = 0.7
- [ ] RSI + MACD confirmation = 0.9
- [ ] MACD alone = 0.6
- [ ] Neutral = 0.5

---

## 🧮 Test Dữ Liệu (Test Vectors)

### Test 1: Oversold (BUY)
```
Prices: [40, 41, 39, 38, 37, 36, 35, 34, 33, 32, 31, 30, 29, 28, 27]
RSI: ~10-20 (Oversold)
Expected: BUY signal, confidence 70-90%
```

### Test 2: Overbought (SELL)
```
Prices: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94]
RSI: ~90-95 (Overbought)
Expected: SELL signal, confidence 70-90%
```

### Test 3: Neutral
```
Prices: [50, 50.1, 49.9, 50.2, 49.8, 50.1, 49.9, 50, 50.1, 50.2, 49.8, 50, 50.1, 50.2]
RSI: ~40-60 (Neutral)
MACD: ~0 (Neutral)
Expected: HOLD signal, confidence 50%
```

---

## 🚀 Full Testing Workflow

```bash
# 1️⃣ Run all unit tests
npm run test:signals

# 2️⃣ Seed test data
python3 backend/scripts/quick_seed.py

# 3️⃣ Start dev server
npm run dev

# 4️⃣ Run integration test
npx ts-node scripts/test-signal-generation.ts

# 5️⃣ Check database
# SELECT * FROM trading_signals ORDER BY created_at DESC LIMIT 10;

# 6️⃣ Test API endpoint
curl "http://localhost:3000/api/v1/signals" \
  -H "Authorization: Bearer YOUR_JWT"

# 7️⃣ Verify outputs manually
# Check: RSI values, MACD values, Signal types, Confidence scores
```

---

## 🎯 Success Criteria

### ✅ Unit Tests Pass
- [ ] RSI calculations correct (±0.5 error margin)
- [ ] MACD calculations correct
- [ ] Signal types correct (BUY/SELL/HOLD)
- [ ] Confidence scores within 0.5-0.9 range
- [ ] Database saves work
- [ ] Error handling works

### ✅ Integration Test Pass
- [ ] All 4 symbols generate signals
- [ ] Types are BUY/SELL/HOLD (not other values)
- [ ] Confidence 0.5-0.9
- [ ] Reasons include indicator names

### ✅ API Test Pass
- [ ] Returns 200 OK
- [ ] Valid JSON response
- [ ] Signal fields present & correct
- [ ] Indicators correct
- [ ] Timestamp valid

---

## 🔍 Common Issues & Fixes

### Issue 1: "Insufficient data"
```
Cause: <14 prices in database
Fix: Run quick_seed.py to generate 50 trades
```

### Issue 2: All signals are HOLD
```
Cause: Market data too neutral (RSI ~50)
Fix: This is correct! HOLD is valid when uncertain
```

### Issue 3: RSI always 50
```
Cause: Prices array not sorted correctly
Fix: Ensure prices are oldest→newest (ascending)
```

### Issue 4: MACD mismatch
```
Cause: EMA calculation precision
Fix: Use ±0.001 tolerance for float comparison
```

---

## 📝 Files Involved

- **Algorithm**: `/backend/ml/signal-generator.ts`
- **Tests**: `/backend/ml/__tests__/signal-generator.test.ts`
- **Integration**: `/scripts/test-signal-generation.ts`
- **Database**: `trading_signals` table
- **Components**: `/src/components/dashboard/SignalCard.tsx`

---

## 🎉 Done!

Khi tất cả test pass, thuật toán tín hiệu chạy đúng! ✨

**Next steps:**
1. Deploy signals to production
2. Monitor signal accuracy (win rate)
3. Tune confidence thresholds
4. Add more indicators (Bollinger Bands, Stochastic, etc.)
