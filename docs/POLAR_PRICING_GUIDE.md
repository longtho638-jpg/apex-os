# 💳 POLAR.SH - VIRAL REBATE ECONOMICS PRICING GUIDE

**Last Updated**: 2025-11-27  
**Model**: Hybrid (Subscription + Rebate Distribution + 4-Level Commission)  
**Payment Provider**: Polar.sh (tier subscriptions only)

---

## 🎯 **BUSINESS MODEL OVERVIEW**

### **Apex OS = VIRAL FINTECH SAAS**

**3 Revenue Streams**:

1. **Tier Subscriptions** (via Polar.sh)
   - Users pay monthly/annual fee for platform access
   - Predictable recurring revenue (MRR)
   - Tiers: FREE, BASIC, TRADER, PRO, ELITE, APEX

2. **Trading Volume Rebates** (Internal Wallet)
   - Users trade on connected exchanges
   - Platform collects ~0.08% rebate from exchanges
   - Users keep portion based on tier (40%-60%)
   - Remaining goes to commission pool

3. **Referral Commissions** (4-Level Viral Loop)
   - Users earn from referrals' trading volume (L1-L4)
   - Commission % based on referrer's tier (5%-50%)
   - Distributed from monthly commission pool
   - 90% pool distributed, 10% retained by platform

---

## 💰 **TIER PRICING** (From `REVENUE_PROJECTIONS.md`)

### **Monthly Subscriptions**

| Tier | Monthly Price | Annual Price | Annual Savings | Target Users |
|:-----|:-------------:|:------------:|:--------------:|:-------------|
| **FREE** | $0 | N/A | N/A | Beginners, trial users |
| **BASIC** | **$29** | $240 | $108 (27%) | Casual traders |
| **TRADER** | **$97** ⭐ | $970 | $194 (17%) | Volume traders, copy trading |
| **PRO** | **$297** | $2,970 | $594 (17%) | Pro traders, AI arbitrage |
| **ELITE** | **$997** | $9,970 | $1,994 (17%) | Funds, institutions |

**Annual Discount**: 2 months free (17% savings) - incentivizes longer commitment

---

## 📊 **REBATE & COMMISSION STRUCTURE**

### **Tier Benefits** (From `tier-manager.ts`)

| Tier | Subscription | User Rebate % | Commission Rate | Requirements |
|:-----|:------------:|:-------------:|:---------------:|:-------------|
| **FREE** | $0 | **60%** | 5% | None |
| **BASIC** | $29/mo | **60%** | 10% | 5 refs + $10k vol |
| **TRADER** | $97/mo | **55%** | 20% | 20 refs + $50k vol |
| **PRO** | $297/mo | **50%** | 30% | 50 refs + $200k vol |
| **ELITE** | $997/mo | **45%** | 40% | 100 refs + $1M vol |
| **APEX** | FREE* | **40%** | 50% | 500 refs + $5M vol |

**Key Insight**:
- **Lower tiers**: Keep more rebate (60%), earn less from refs (5-10%)
- **Higher tiers**: Keep less rebate (40%), earn MORE from refs (50%)
- **Trade-off**: Pay for platform access, share rebate for network earnings

_*APEX tier: Free subscription after reaching requirements (reward for viral growth)_

---

## 🔄 **HOW THE VIRAL LOOP WORKS**

### **Example: User Journey**

**Month 1**: User joins FREE tier
- Trades $50k/month
- Earns: $50k × 0.0008 × 60% = **$24 rebate kept**
- Platform gets: $50k × 0.0008 × 40% = $16 to pool

**Month 2**: User upgrades to TRADER ($97/mo)
- Refers 5 friends (all FREE tier)
- Each friend trades $30k/month
- **Direct rebate**: $50k × 0.0008 × 55% = $22 (keep less than FREE)
- **L1 commission**: 5 friends × ($30k × 0.0008 × 40%) × 20% = **$19.20**
- **Net**: $22 + $19.20 - $97 = -$55.80 (negative at low volume)

**Month 6**: User has 20 active referrals (L1-L4)
- Personal trading: $100k/month
- Network trading: $50k avg × 20 = $1M/month
- **Direct rebate**: $100k × 0.0008 × 55% = $44
- **Commission earnings**:
  - L1 (10 refs): $50k × 0.0008 × 40% × 20% × 10 = $32
  - L2 (5 refs): $50k × 0.0008 × 40% × 10% × 5 = $8
  - L3 (3 refs): $50k × 0.0008 × 40% × 5% × 3 = $2.40
  - L4 (2 refs): $50k × 0.0008 × 40% × 2.5% × 2 = $0.80
- **Total**: $44 + $32 + $8 + $2.40 + $0.80 = **$87.20/month**
- **ROI**: $87.20 - $97 = -$9.80 ✅ (almost break-even + get platform value!)

**At scale** (50+ referrals, PRO tier):
- Commission earnings: $200-500/month
- Subscription cost: $297/month
- **ROI**: Depends on network, but NET POSITIVE for active promoters

---

## 💸 **POLAR.SH TRANSACTION FEES**

### **Fee Structure**
- **Rate**: **5% + $0.40** per transaction
- **No monthly fees**
- **Includes**: Payment processing, VAT handling, invoicing

### **Net Revenue Calculation**

| Tier | Gross MRR | Polar Fee | Net MRR | Annual Net |
|:-----|----------:|:---------:|--------:|-----------:|
| BASIC | $29 | $1.85 | **$27.15** | $325.80 |
| TRADER | $97 | $5.25 | **$91.75** | $1,101 |
| PRO | $297 | $15.25 | **$281.75** | $3,381 |
| ELITE | $997 | $50.25 | **$946.75** | $11,361 |

**Annual Subscriptions** (better margins):
| Tier | Annual Gross | Polar Fee | Net Revenue |
|:-----|-------------:|:---------:|------------:|
| BASIC | $240 | $12.40 | **$227.60** |
| TRADER | $970 | $49.10 | **$920.90** |
| PRO | $2,970 | $149.10 | **$2,820.90** |
| ELITE | $9,970 | $499.10 | **$9,470.90** |

---

## 📈 **MONTH 1 REVENUE PROJECTION**

**Target**: 100 users (from `REVENUE_PROJECTIONS.md`)

**Distribution**:
- 50 FREE (no sub revenue)
- 30 BASIC @ $29 = $900
- 15 TRADER @ $97 = $1,455
- 5 PRO @ $297 = $1,485
- 0 ELITE

**Subscription MRR**: $3,840  
**After Polar fees**: ~$3,600 net

**Trading Volume Rebates** (Estimated):
- Total volume: 100 users × $30k avg = $3M
- Exchange rebate: $3M × 0.0008 = $2,400
- User rebates (avg 55%): $1,320 paid to users
- **Pool**: $1,080
- Distributed (90%): $972 to referrers
- **Platform retained**: $108

**Total Month 1 Revenue**: $3,600 (subs) + $108 (pool) = **$3,708 net**

(Note: REVENUE_PROJECTIONS.md shows $2,420 MRR - likely different user distribution)

---

## 🛠️ **POLAR.SH SETUP - CORRECT APPROACH**

### **What Polar is Used For**
✅ Tier subscription billing (BASIC $29, TRADER $97, etc.)  
✅ Recurring payments (monthly/annual)  
✅ Invoicing & tax handling  
✅ Subscription management (upgrades, cancellations)

### **What Polar is NOT Used For**
❌ Rebate distribution (handled via internal wallet)  
❌ Commission payouts (handled via Binance Pay or internal wallet)  
❌ Trading volume tracking (handled via exchange APIs)

---

### **Step 1: Create Products** (20 mins)

**Products to Create**:

1. **BASIC Monthly**
   - Name: `Apex BASIC (Monthly)`
   - Price: $29 USD
   - Billing: Recurring Monthly
   - Description: 5 exchanges, basic signals, portfolio tracking

2. **BASIC Annual**
   - Name: `Apex BASIC (Annual - Save 27%)`
   - Price: $240 USD
   - Billing: Recurring Yearly
   - Badge: 🔥 SAVE $108

3. **TRADER Monthly** ⭐
   - Name: `Apex TRADER (Monthly)`
   - Price: $97 USD
   - Billing: Recurring Monthly
   - Description: Copy trading, advanced AI signals, L1-L2 rebates
   - Badge: ⭐ MOST POPULAR

4. **TRADER Annual**
   - Name: `Apex TRADER (Annual - Save 17%)`
   - Price: $970 USD
   - Billing: Recurring Yearly
   - Badge: 🔥 SAVE $194

5. **PRO Monthly**
   - Name: `Apex PRO (Monthly)`
   - Price: $297 USD
   - Billing: Recurring Monthly
   - Description: AI arbitrage engine, L1-L4 rebates, priority support

6. **PRO Annual**
   - Name: `Apex PRO (Annual - Save 17%)`
   - Price: $2,970 USD
   - Billing: Recurring Yearly
   - Badge: 🔥 SAVE $594

7. **ELITE Monthly**
   - Name: `Apex ELITE (Monthly)`
   - Price: $997 USD
   - Billing: Recurring Monthly
   - Description: API access, dedicated account manager, custom algo

8. **ELITE Annual**
   - Name: `Apex ELITE (Annual - Save 17%)`
   - Price: $9,970 USD
   - Billing: Recurring Yearly
   - Badge: 🔥 SAVE $1,994

---

### **Step 2: Configure Webhooks** (10 mins)

**Events to Subscribe**:
- ✅ `subscription.created` → Update user tier in database
- ✅ `subscription.updated` → Handle upgrade/downgrade
- ✅ `subscription.canceled` → Revert to FREE tier
- ✅ `payment.succeeded` → Confirm active subscription
- ✅ `payment.failed` → Send payment retry notification

**Webhook URL**: `https://apexrebate.com/api/webhooks/polar`

**Handler Logic** (`src/app/api/webhooks/polar/route.ts`):
```typescript
// On subscription.created or subscription.updated:
if (event.type === 'subscription.created' || event.type === 'subscription.updated') {
  const productId = event.data.product_id;
  const userId = event.data.customer_id; // Map to internal user_id
  
  // Map Polar product to tier
  const tierMap = {
    'basic_monthly': 'BASIC',
    'basic_annual': 'BASIC',
    'trader_monthly': 'TRADER',
    'trader_annual': 'TRADER',
    'pro_monthly': 'PRO',
    'pro_annual': 'PRO',
    'elite_monthly': 'ELITE',
    'elite_annual': 'ELITE'
  };
  
  const tier = tierMap[productId];
  
  // Update user_tiers
  await supabase.from('user_tiers').update({
    tier: tier,
    current_commission_rate: TIERS[tier].commission,
    updated_at: new Date()
  }).eq('user_id', userId);
}

// On subscription.canceled:
if (event.type === 'subscription.canceled') {
  await supabase.from('user_tiers').update({
    tier: 'FREE',
    current_commission_rate: 0.05
  }).eq('user_id', userId);
}
```

---

### **Step 3: Add Environment Variables** (5 mins)

**Vercel Environment Variables**:
```bash
POLAR_API_KEY=polar_ak_xxxxxxxxxxxxx
POLAR_SECRET=polar_sk_xxxxxxxxxxxxx
POLAR_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🎨 **PRICING PAGE DESIGN**

### **Information to Display**

**For Each Tier Card**:
1. **Subscription Price**: $29/mo, $97/mo, etc.
2. **Annual Option**: "Save $194 - $970/year"
3. **User Rebate %**: "Keep 60% of trading rebates"
4. **Commission Rate**: "Earn 20% from referral network"
5. **Auto-Unlock Requirements**: "20 refs + $50k volume → auto-upgrade"
6. **Features**: Copy trading, AI signals, etc.

**Example** (TRADER Tier):
```
💎 TRADER - $97/month
⭐ MOST POPULAR

Or $970/year (SAVE $194)

📊 Platform Features:
✅ Copy Trading (Auto-follow top traders)
✅ Advanced AI Trading Signals
✅ 10 Exchange Connections
✅ Unlimited Trading History
✅ Priority Support
✅ Mobile App Access

💰 Rebate Economics:
📈 Keep 55% of your exchange rebates
🎁 Earn 20% from L1-L4 referral network trading

🎯 Auto-Unlock Requirements:
20 active referrals + $50,000 monthly volume

[Get Started →]
```

---

## 🧮 **COMMISSION POOL MECHANICS**

### **Monthly Distribution Process**

**Step 1**: Aggregate Trading Volume
```sql
-- Run monthly cron job
SELECT SUM(monthly_volume) FROM user_tiers WHERE updated_at >= '2025-11-01';
```

**Step 2**: Calculate Total Rebate Pool
```typescript
const totalVolume = 5000000; // $5M for example
const exchangeRebateRate = 0.0008; // 0.08%
const totalRebate = totalVolume * exchangeRebateRate; // $4,000
```

**Step 3**: Deduct User Rebates
```typescript
// Each user keeps their rebate % (40%-60%)
const userRebates = calculateUserRebates(); // ~$2,200 (55% avg)
const poolRemaining = totalRebate - userRebates; // $1,800
```

**Step 4**: Distribute to Referrers (90%)
```typescript
const distributionAmount = poolRemaining * 0.90; // $1,620
const platformRetained = poolRemaining * 0.10; // $180

// Calculate each user's commission (L1-L4)
for (const user of activeUsers) {
  const commission = calculateUserCommission(user.id, 'current_month');
  // Store in commission_transactions table
}
```

**Step 5**: Apply Scaling Factor (if needed)
```typescript
const totalCommissionsCalculated = 1700; // Theoretical total
const maxPayout = distributionAmount; // $1,620

if (totalCommissionsCalculated > maxPayout) {
  const scalingFactor = maxPayout / totalCommissionsCalculated; // 0.953
  // Scale down all commissions proportionally
}
```

---

## 💡 **OPTIMIZATION STRATEGIES**

### **Push Annual Subscriptions**
- **Better cashflow**: Get $970 upfront vs $97/month
- **Lower churn**: Committed for full year
- **Fewer fees**: 1 transaction vs 12 (save on Polar fees)
- **Higher LTV**: $920 net annual vs ~$1,101 monthly net

### **Tier Upgrade Incentives**
- **Progress bars**: "80% to TRADER - Refer 4 more users!"
- **Limited-time**: "Upgrade to TRADER before Dec 1 - Save 50% first month"
- **Social proof**: "500+ traders earning $200/mo from referrals"

### **Viral Amplification**
- **Email templates**: "Share your referral link - Earn passive income"
- **Dashboard widgets**: "Your network earned you $47 this month"
- **Leaderboards**: "Top 10 referrers get bonus commission multiplier"

---

## ❓ **FAQ**

**Q: Why does rebate % decrease as tier increases?**  
A: Higher tiers prioritize network earnings over personal rebate. TRADER keeps 55% but earns 20% from refs. At scale, 20% of $1M network > 60% of $100k personal.

**Q: Can I earn commission without paid subscription?**  
A: Yes! FREE tier earns 5% commission. But to unlock higher rates (20%-50%), you need to upgrade AND meet requirements (refs + volume).

**Q: How is commission paid out?**  
A: Monthly, via internal wallet. You can withdraw to Binance Pay (crypto) or bank transfer (future).

**Q: What if I don't have referrals?**  
A: You still get rebate % from your own trading! BASIC tier = 60% rebate on $0 subscription cost initially, then $29/mo for platform features.

**Q: Why use Polar.sh instead of Stripe?**  
A: Polar handles VAT/sales tax automatically. Stripe requires separate tax integration.

---

## 🚀 **LAUNCH CHECKLIST**

### **Before Going Live**:
- [ ] Create 8 products in Polar (4 tiers × 2 billing periods)
- [ ] Configure webhook endpoint + test with Polar sandbox
- [ ] Update pricing page with rebate % + commission % display
- [ ] Test subscription flow end-to-end
- [ ] Verify tier upgrade auto-triggers commission rate update
- [ ] Set up commission pool cron job (monthly)
- [ ] Test rebate distribution to internal wallet

### **Post-Launch Monitoring**:
- [ ] Track MRR by tier (Polar dashboard)
- [ ] Monitor churn rate (especially BASIC tier)
- [ ] Track conversion: FREE → paid tier
- [ ] Track viral coefficient: refs per user
- [ ] Monitor commission pool scaling factor (should be < 1.0)

---

## 🎯 **SUCCESS METRICS**

**Month 1 Targets**:
- 100 users (50 FREE, 30 BASIC, 15 TRADER, 5 PRO)
- $3,600 net MRR (after Polar fees)
- Average 2 referrals per paid user = viral coefficient 2.0
- Pool distribution working correctly (90% paid, 10% retained)

**Month 6 Targets**:
- 7,800 users (35k FREE, 3k BASIC, 4k TRADER, 800 PRO, 30 ELITE)
- $742k MRR (from REVENUE_PROJECTIONS.md)
- $1M+ net profit (cumulative)
- Viral loop self-sustaining (organic growth >80%)

---

_Aligned with viral rebate economics strategy - not pure SaaS!_ 🚀💎⚔️
