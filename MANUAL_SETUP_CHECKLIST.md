# 🚨 ONE-TIME MANUAL SETUP CHECKLIST
## **CRITICAL PATH TO REVENUE - ANH'S ACTION ITEMS**

**Status**: Out of money - URGENT execution required  
**Goal**: Complete setup → Launch → First $2k MRR (Month 1)  
**Principle**: Do once, run forever. Zero recurring manual work.

---

## ⚡ **SUPER CRITICAL - DO FIRST (30 minutes)**
**These 4 items = System goes live**

### ✅ **1. Deploy Database Migrations** (5 mins)
```bash
cd /Users/macbookprom1/apex-os
supabase db push
```

**What this does**:
- Deploys RLS policies (security for 5 viral tables)
- Deploys paper trading schema (4 tables)
- **Result**: Database production-ready

**Verify**:
```bash
supabase db remote ls
# Should show: 20251127_rls_policies.sql, 20251127_paper_trading.sql
```

---

### ✅ **2. Verify Sentry Configuration** (2 mins) - ALREADY DONE ✅

**Steps**:
1. Check Vercel env vars has: `NEXT_PUBLIC_SENTRY_DSN`
2. If not set, go to Sentry.io → Get DSN → Add to Vercel
3. Redeploy if DSN was just added

**Status**: Anh đã có Sentry rồi ✅

**Result**: Real-time error monitoring active

---

### ✅ **3. Push Code to Production** (10 mins)
```bash
cd /Users/macbookprom1/apex-os
git push origin main
```

**Wait for**:
- Vercel auto-deploy (~5 mins)
- Check: https://vercel.com/dashboard
- Status should be "Ready"

**Verify**:
- Visit: https://apexrebate.com
- Check: Console has no errors
- Check: Sentry receiving data (sentry.io dashboard)

---

### ✅ **4. Seed Test Data** (10 mins)

**Get real user IDs**:
```sql
-- Run in Supabase SQL Editor
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 4;
```

**Update seed script**:
1. Open: `scripts/seed-viral-economics.sql`
2. Replace placeholder UUIDs (lines 7-10):
   ```sql
   user1_id UUID := '<paste real UUID from query>';
   user2_id UUID := '<paste real UUID from query>';
   user3_id UUID := '<paste real UUID from query>';
   user4_id UUID := '<paste real UUID from query>';
   ```
3. Run entire script in Supabase SQL Editor

**Verify**:
```sql
SELECT tier, COUNT(*) FROM user_tiers GROUP BY tier;
-- Should return: FREE(1), BASIC(1), TRADER(1), PRO(1)
```

**Result**: Can test referral system with real data

---

## 💰 **CRITICAL FOR REVENUE - DO TODAY (2 hours)**
**These enable payment = money in**

### ✅ **5. Polar.sh Setup** (30 mins) - FOR TIER SUBSCRIPTIONS ONLY

**Why**: Tier subscription billing (platform access fees)  
**NOT For**: Rebate distribution or commission payouts (handled internally)

**📋 DETAILED GUIDE**: See `docs/POLAR_PRICING_GUIDE.md` for:
- **CORRECT viral rebate economics model** (subscription + rebate + commission)
- Pricing from REVENUE_PROJECTIONS.md: BASIC $29, TRADER $97, PRO $297, ELITE $997
- Monthly vs Annual options (17% annual discount = 2 months free)
- Rebate % structure (60% → 40% as tier increases)
- Commission rates (5% → 50% as tier increases)  
- Step-by-step Polar setup
- Webhook integration examples

**Quick Steps**:
1. **Sign up**: https://polar.sh
2. **Create 8 Products** (4 tiers × monthly/annual):
   - **BASIC**: $29/mo, $240/year (17% discount)
   - **TRADER**: $97/mo, $970/year (17% discount) ⭐ Most Popular
   - **PRO**: $297/mo, $2,970/year (17% discount)
   - **ELITE**: $997/mo, $9,970/year (17% discount)

3. **Configure Webhooks**:
   - Webhook URL: `https://apexrebate.com/api/webhooks/polar`
   - Events: `subscription.created`, `subscription.updated`, `subscription.canceled`
   - Sign secret: Save as `POLAR_WEBHOOK_SECRET`

4. **Verify Integration** (After deployment):
   ```bash
   # Test subscription creation
   curl -X POST https://apexrebate.com/api/subscribe \
     -d '{"tier":"TRADER","billing":"monthly"}'
   ```

5. **Important Notes**:
   - ⚠️ Polar.sh handles ONLY tier subscriptions, NOT commission payouts
   - Commission payouts handled by internal wallet + NOWPayments (see #6)
   - Verify webhook signatures in production

---

## 6️⃣ Realtime Commission + Auto Payout System

**Status**: ✅ Code complete (by Gemini CLI)  
**Owner**: Engineering  
**Priority**: HIGH  
**Timeline**: Deploy with Week 3-4

### **What Was Built**:
Gemini CLI implemented complete realtime commission + automated anonymous payout system (1,386 lines):

**Phase 1 - Database** ✅:
- `supabase/migrations/20251127_realtime_wallet_system.sql`
- Tables: `user_wallets`, `commission_events`, `withdrawal_requests`, `withdrawal_audit_log`
- Functions: `credit_user_balance_realtime()`, `reserve_balance_for_withdrawal()`

**Phase 2 - Realtime Commission** ✅:
- Trade webhook → instant commission calculation
- L1-L4 referral commissions with multipliers
- Tests: 2 passed

**Phase 3 - Withdrawal + Agent** ✅:
- Withdrawal API with SHA256 checksums
- Fraud detection agent (risk scoring)
- Balance reconciliation

**Phase 4 - NOWPayments Integration** ✅:
- Auto-execution after admin approval
- Sandbox/production mode support
- Tests: 2 passed

**Phase 5 - Realtime Dashboard** ✅:
- Supabase Realtime subscriptions
- Instant balance updates (<1 second)

### **Setup Tasks**:

1. **Deploy Database Migration**:
   ```bash
   # Link Supabase project
   supabase link --project-ref <your-ref>
   
   # Push migration
   supabase db push
   ```

2. **Setup NOWPayments Sandbox**:
   - Sign up: https://nowpayments.io
   - Enable Sandbox Mode
   - Get API key + enable payouts
   - Add test funds (10,000 USDT)
   - See: `docs/NOWPAYMENTS_SANDBOX_SETUP.md`

3. **Configure Environment Variables**:
   ```bash
   # NOWPayments
   NOWPAYMENTS_API_KEY=<sandbox-api-key>
   NOWPAYMENTS_EMAIL=<your-email>
   NOWPAYMENTS_PASSWORD=<your-password>
   NOWPAYMENTS_SANDBOX=true
   
   # Supabase
   SUPABASE_JWT_SECRET=<jwt-secret>
   ```

4. **Deploy & Test**:
   ```bash
   # Deploy code
   git push origin main
   
   # Test realtime commission
   curl -X POST https://apexrebate.com/api/webhooks/trade-executed \
     -d '{"user_id":"test-user","volume":10000}'
   
   # Test withdrawal
   curl -X POST https://apexrebate.com/api/v1/wallet/withdraw \
     -d '{"amount":50,"crypto_address":"TXyz..."}'
   ```

5. **Important Notes**:
   - ⚠️ Test in SANDBOX mode first
   - Set `NOWPAYMENTS_SANDBOX=false` only after testing
   - All withdrawals have SHA256 checksums (fraud prevention)
   - Admin approval triggers auto-execution (no manual intervention)
   - Full audit trail in `withdrawal_audit_log`

6. **Documentation**:
   - Implementation: `GEMINI_TASK_REALTIME_PAYOUT.md`
   - Walkthrough: `walkthrough.md` (in artifacts)
   - Security: `docs/WITHDRAWAL_AUTOMATION_SECURITY.md`
   - Alternatives: `docs/COMMISSION_PAYOUT_ALTERNATIVES.md`

---

### ⏸️ **7. Binance Pay Setup** (30 mins) - OPTIONAL / HIDDEN FOR NOW

**Status**: Tạm thời ẩn, sẽ dùng sau ✅  
**Why**: Crypto payments (for crypto traders who prefer USDT/BTC)  
**When to enable**: After getting traction with Polar.sh (credit cards)

**Steps**:
1. **Register Merchant**: https://merchant.binance.com
   - Business verification required (may take 1-2 days)
   - Prepare: Business license, ID
2. **Get API Credentials**:
   - Dashboard → API Management
   - Create API Key
   - Copy: API Key + Secret Key
3. **Add to Vercel**:
   - `BINANCE_PAY_API_KEY=<paste key>`
   - `BINANCE_PAY_SECRET=<paste secret>`
4. **Setup Webhook** (after merchant approved):
   - Binance Merchant → Webhook Settings
   - URL: `https://apexrebate.com/api/webhooks/binance-pay`
   - Copy webhook secret → Add to Vercel

**Note**: Merchant approval takes 1-2 business days. Can launch without this first, add later.

**Result**: Can accept crypto payments (USDT, BTC, ETH)

---

## 🤖 **CRITICAL FOR AI REVENUE - DO WEEK 2** (1 hour)
**These enable AI signals = premium tier value**

### ✅ **7. Binance API Key** (15 mins)

**Why**: Get real-time market data for AI trading signals

**Steps**:
1. **Login**: https://www.binance.com
2. **Create API Key**:
   - Account → API Management
   - Create Key
   - Permissions: **Read Only** (for data collection ONLY)
   - IP Whitelist: Add Vercel IPs (or leave unrestricted for dev)
3. **Copy Credentials**:
   - API Key
   - Secret Key
4. **Add to Vercel**:
   - `BINANCE_API_KEY=<paste key>`
   - `BINANCE_SECRET=<paste secret>`

**Verify**:
```bash
# Test connection (run locally first)
cd backend/agents
python data_agent.py --test-connection
# Should output: "✅ Binance API connected successfully"
```

**Result**: Can collect market data for AI

---

### ✅ **8. Start Data Collection** (15 mins)

**Run Data Agent** (after Binance API key added):
```bash
cd /Users/macbookprom1/apex-os/backend/agents
python data_agent.py --start --symbols=BTCUSDT,ETHUSDT,BNBUSDT

# Or use cron (preferred):
# Add to crontab:
*/5 * * * * cd /Users/macbookprom1/apex-os/backend/agents && python data_agent.py --collect
```

**What this does**:
- Collects OHLCV data every 5 minutes
- Stores in Supabase `market_data_ohlcv` table
- Needed for ML model training

**Verify**:
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM market_data_ohlcv;
-- Should increase every 5 minutes
```

**Result**: Data flowing for AI training

---

## 📊 **MONITORING - SETUP ONCE** (30 mins)

### ✅ **9. Uptime Monitoring** (15 mins)

**Recommended**: Better Stack (free tier)

**Steps**:
1. Sign up: https://betterstack.com
2. Add monitor:
   - Name: "Apex OS Main Site"
   - URL: `https://apexrebate.com`
   - Check interval: 1 minute
3. Add monitor:
   - Name: "Apex OS API Health"
   - URL: `https://apexrebate.com/api/health`
   - Check interval: 1 minute
4. Setup alerts:
   - Email: anh's email
   - Telegram: (optional) create bot, add channel

**Alternative**: UptimeRobot (free) - same setup

**Result**: Know immediately if site goes down

---

### ✅ **10. Analytics Setup** (15 mins)

**Option 1: Vercel Analytics** (Easiest - already built in)
- Just enable in Vercel dashboard → Analytics tab
- Free tier: 2500 events/day

**Option 2: PostHog** (More features - optional)
1. Sign up: https://posthog.com
2. Get Project API Key
3. Add to Vercel: `NEXT_PUBLIC_POSTHOG_KEY=<key>`
4. Code already integrated (check `src/lib/analytics.ts`)

**Result**: Track user behavior, conversions

---

## 🎯 **GDPR/COMPLIANCE - SETUP ONCE** (1 hour - can do later)

### ✅ **11. Privacy Policy & Terms** (30 mins)

**Use template generator**:
- https://www.termsfeed.com/privacy-policy-generator/
- https://www.termsfeed.com/terms-conditions-generator/

**Input**:
- Company: Apex Rebate
- Services: Trading platform, AI signals, rebates
- Data collected: Email, wallet addresses, trading data
- Cookie usage: Yes (analytics)

**Output**:
- Download Privacy Policy
- Download Terms of Service
- Add to: `src/app/[locale]/privacy/page.tsx`
- Add to: `src/app/[locale]/terms/page.tsx`

**Result**: Legal compliance

---

### ✅ **12. Cookie Consent** (30 mins)

**Current**: Already implemented in code (`src/components/CookieConsent.tsx`)

**Just verify**:
- Banner shows on first visit
- User can accept/reject
- Preference saved in localStorage

**If need changes**: Update `src/components/CookieConsent.tsx`

**Result**: GDPR compliant

---

## 📧 **MARKETING - SETUP ONCE** (2 hours - can do later)

### ✅ **13. Email Service** (30 mins)

**Recommended**: Resend.com (free tier: 100 emails/day)

**Steps**:
1. Sign up: https://resend.com
2. Verify domain: apexrebate.com
   - Add DNS records (provided by Resend)
3. Get API Key
4. Add to Vercel: `RESEND_API_KEY=<key>`

**Result**: Can send transactional emails (signup, password reset, commission alerts)

---

### ✅ **14. Social Media Accounts** (1 hour)

**Create accounts** (use same branding):
- Twitter/X: @ApexRebate
- Telegram: t.me/ApexRebate
- Discord: (optional for community)

**Post first content**:
- Use blog post: "Death of Manual Trading"
- Schedule tweets (use Buffer or Hypefury)
- Post in crypto trading communities

**Result**: Traffic channels ready

---

## 💳 **DOMAIN & DNS - ONE TIME** (already done?)

### ✅ **15. Verify Domain Setup**

**Check current setup**:
```bash
dig apexrebate.com
dig www.apexrebate.com
```

**Should point to**: Vercel

**If not setup**:
1. Go to domain registrar (e.g., Namecheap, GoDaddy)
2. Add DNS records (from Vercel dashboard → Domains)
3. Wait for propagation (5-30 mins)

**Result**: apexrebate.com works

---

## 🔧 **DEV TOOLS - ONE TIME** (optional)

### ✅ **16. Redis Setup** (if not using Vercel KV)

**Option 1: Upstash** (Free tier - recommended)
1. Sign up: https://upstash.com
2. Create Redis database
3. Copy: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Add to Vercel

**Option 2: Vercel KV** (Built-in)
1. Vercel Dashboard → Storage → Create KV
2. Auto-adds to environment variables

**Result**: Rate limiting works

---

## 📋 **MASTER CHECKLIST - DO IN ORDER**

### **DAY 1 (TODAY) - System Live** ✅ 30 mins
- [ ] 1. Deploy database migrations (`supabase db push`)
- [ ] 2. Add Sentry DSN to Vercel
- [ ] 3 Push code (`git push origin main`)
- [ ] 4. Seed test data (update UUIDs, run SQL)

**After Day 1**: System is LIVE and SECURE ✅

---

### **DAY 1 (EVENING) - Payments Live** 💰 2 hours
- [ ] 5. Polar.sh setup (credit cards)
- [ ] 6. Binance Pay setup (crypto) - can do Day 2 if merchant approval takes time
- [ ] 9. Uptime monitoring setup
- [ ] 10. Analytics enable (Vercel Analytics)

**After Day 1 Evening**: CAN ACCEPT PAYMENTS ✅

---

### **WEEK 1 - AI Data Ready** 🤖 1 hour
- [ ] 7. Binance API key (read-only)
- [ ] 8. Start data collection (run data agent)

**After Week 1**: AI can start training ✅

---

### **WEEK 2 - Growth Ready** 📈 3 hours
- [ ] 11. Privacy Policy & Terms
- [ ] 12. Cookie consent (verify)
- [ ] 13. Email service (Resend)
- [ ] 14. Social media accounts
- [ ] 16. Redis setup (if needed)

**After Week 2**: Ready for scaling ✅

---

## 🚨 **CRITICAL PATH TO REVENUE**

### **Timeline to First $$$**:
```
TODAY (30 mins):     System live ✅
TODAY (2 hours):      Can accept payment ✅
TOMORROW:            First paying user check

Week 1:              AI data collecting
Week 2:              Content marketing
Week 3:              Refine product
Week 4:              SOFT LAUNCH → First 100 users → $2K MRR
```

### **Revenue Blockers** (MUST DO):
1. ✅ Polar.sh setup (Item #5) - **CRITICAL**
2. ✅ Binance Pay setup (Item #6) - **HIGH**
3. ✅ Deploy code (Item #3) - **CRITICAL**

### **Optional** (can skip initially):
- Binance API (#7) - nice to have, not blocking
- Email service (#13) - can use free Gmail initially
- Social media (#14) - can do gradually

---

## 💰 **COST OPTIMIZATION**

### **Free Tier Everything**:
- ✅ Supabase: Free (up to 500MB database)
- ✅ Vercel: Free (hobby plan)
- ✅ Sentry: Free (5k events/month)
- ✅ Better Stack: Free (10 monitors)
- ✅ Resend: Free (100 emails/day)
- ✅ Upstash Redis: Free (10k commands/day)

**Total Monthly Cost**: ~$0 until revenue

**First recurring costs** (only when revenue comes):
- Polar.sh: 2.9% + $0.30 per transaction
- Binance Pay: 1% per transaction

---

## 🎯 **SUCCESS CRITERIA**

### **After completing this checklist**:
- ✅ Site live: apexrebate.com
- ✅ Payments working: Can process credit card + crypto
- ✅ Monitoring active: Know if anything breaks
- ✅ Data flowing: AI can train
- ✅ Zero manual work needed: Everything automated

### **What runs automatically**:
- User signup → Tier created (FREE)
- User refers → Referral tracked
- User trades → Commission calculated
- User upgrades → Payment processed
- Data collected → ML trains
- Errors happen → Sentry alerts

**Zero recurring manual work needed!**

---

## 📞 **NEED HELP?**

**Stuck on any item?**
1. Check `docs/` folder for detailed guides
2. Ask Claude/Gemini for specific setup
3. Consult provider documentation

**Guides available**:
- `docs/SENTRY_SETUP.md`
- `docs/POLAR_INTEGRATION_GUIDE.md`
- `docs/BINANCE_PAY_INTEGRATION_GUIDE.md`
- `docs/BINANCE_API_SETUP.md`
- `docs/UPTIME_MONITORING_GUIDE.md`

---

## ⚔️ **BINH PHÁP TÔN TỬ**

> **"兵贵速，不贵久"** - Speed is paramount, not prolonged campaigns

**Applied**:
- Do critical items FIRST (Day 1: 30 mins)
- Revenue items NEXT (Day 1: 2 hours)
- Growth items LATER (Week 2+)

> **"知彼知己"** - Know yourself, know enemy

**Applied**:
- We have: Complete system ✅
- We lack: API keys (one-time setup)
- Enemy has: Slow manual setup, high CAC
- We win with: Automated system, $0 CAC

---

**⚡ START WITH DAY 1 CRITICAL (30 mins) → SYSTEM GOES LIVE ✅**

**💰 THEN DAY 1 PAYMENTS (2 hours) → CAN MAKE MONEY ✅**

**Status**: READY TO EXECUTE 🚀💎⚔️
