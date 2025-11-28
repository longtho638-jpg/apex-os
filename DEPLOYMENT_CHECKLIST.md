# 🚀 DEPLOYMENT CHECKLIST - PAYMENT SYSTEMS

**Goal**: Deploy Polar.sh + NOWPayments + Realtime Payout in one go  
**Time**: ~30 mins total  
**Status**: Ready for execution

---

## 📋 ONE-TIME SETUP (Do together)

### **1. Polar.sh Setup** (15 mins)
- [ ] Sign up: https://polar.sh
- [ ] Create products:
  - BASIC: $29/mo, $240/year
  - TRADER: $97/mo, $970/year ⭐
  - PRO: $297/mo, $2,970/year
  - ELITE: $997/mo, $9,970/year
- [ ] Get API keys: Settings → API
- [ ] Setup webhook: `https://apexrebate.com/api/webhooks/polar`
- [ ] Copy credentials:
  ```
  POLAR_API_KEY=polar_ak_xxx
  POLAR_SECRET=polar_sk_xxx
  POLAR_WEBHOOK_SECRET=whsec_xxx
  ```

### **2. NOWPayments Setup** (10 mins)
- [ ] Sign up: https://nowpayments.io
- [ ] Enable **Sandbox Mode**
- [ ] Get API key: Settings → API Keys
- [ ] Enable Payouts (email + password auth)
- [ ] Add test funds: 10,000 USDT
- [ ] Copy credentials:
  ```
  NOWPAYMENTS_API_KEY=NP_xxx
  NOWPAYMENTS_EMAIL=your@email.com
  NOWPAYMENTS_PASSWORD=yourpass
  NOWPAYMENTS_SANDBOX=true
  ```

### **3. Supabase Setup** (5 mins)
- [ ] Link project: `supabase link --project-ref <ref>`
- [ ] Deploy migration: `supabase db push`
- [ ] Verify tables created
- [ ] Get JWT secret: Settings → API → JWT Secret
- [ ] Copy:
  ```
  SUPABASE_JWT_SECRET=xxx
  ```

---

## 🔧 DEPLOYMENT (Em sẽ làm khi anh cung cấp credentials)

### **Step 1: Verify Credentials Locally**
```bash
# Test Polar
curl https://api.polar.sh/v1/products \
  -H "Authorization: Bearer $POLAR_API_KEY"

# Test NOWPayments
./scripts/test-nowpayments-sandbox.sh
```

### **Step 2: Deploy to Vercel**
```bash
# Add all env vars
vercel env add POLAR_API_KEY
vercel env add POLAR_SECRET
vercel env add POLAR_WEBHOOK_SECRET
vercel env add NOWPAYMENTS_API_KEY
vercel env add NOWPAYMENTS_EMAIL
vercel env add NOWPAYMENTS_PASSWORD
vercel env add NOWPAYMENTS_SANDBOX
vercel env add SUPABASE_JWT_SECRET

# Deploy
git push origin main
```

### **Step 3: End-to-End Test**
```bash
# Test 1: Subscription (Polar)
curl -X POST https://apexrebate.com/api/subscribe \
  -d '{"tier":"TRADER","billing":"monthly"}'

# Test 2: Commission (Realtime)
curl -X POST https://apexrebate.com/api/webhooks/trade-executed \
  -d '{"user_id":"test","volume":10000}'

# Test 3: Withdrawal (NOWPayments)
curl -X POST https://apexrebate.com/api/v1/wallet/withdraw \
  -d '{"amount":50,"crypto_address":"TXyz..."}'

# Verify all return success + tx_hash where applicable
```

---

## ✅ WHEN COMPLETE

**Anh cung cấp**:
1. Polar credentials (3 keys)
2. NOWPayments credentials (3 keys)
3. Supabase JWT secret (1 key)

**Em sẽ**:
1. Add to Vercel (7 env vars)
2. Deploy database + code
3. Run integration tests
4. Confirm: ✅ Subscription works, ✅ Commission works, ✅ Payout works

**Total**: 7 env vars → deploy → test → DONE!

---

## 🎯 AFTER DEPLOYMENT - CONTINUE CODE

Em sẽ tiếp tục task lớn:
- [ ] Fix BASIC annual pricing ($290 → $240)
- [ ] Update MANUAL_SETUP_CHECKLIST.md
- [ ] Update MASTER_PROGRESS_TRACKER.md
- [ ] Verify all pricing consistency
- [ ] Update task.md with realtime payout completion

**Status**: Setup gộp lại, ready to deploy when anh provides credentials!

💎⚔️
