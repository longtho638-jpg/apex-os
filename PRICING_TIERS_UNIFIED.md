# 🎯 PRICING TIERS UNIFIED - SINGLE SOURCE OF TRUTH

## CHUẨN HÓA HỆ THỐNG PRICING (Dựa trên Viral Economics + PricingModal)

### 4 TIERS CHÍNH THỨC:

```typescript
export const UNIFIED_TIERS = {
  FREE: {
    name: 'Free',
    price: 0,
    monthlyPrice: 0,
    annualPrice: 0,
    
    // AI Limits
    aiRequestsPerDay: 10,
    tradingSignals: 3, // per month
    
    // Referral Commission (Viral Economics)
    commissionRates: {
      l1: 0,    // 0% - No commission for FREE users
      l2: 0,
      l3: 0,
      l4: 0,
      total: 0  // 0%
    },
    
    // Features
    features: [
      'Basic trading features',
      '10 AI requests per day',
      '3 trading signals per month',
      'Basic technical analysis',
      'Community support (3-5 days)',
    ],
    
    // Binh Pháp: 試探 (Probe) - Free tier để user thử nghiệm
  },
  
  PRO: {
    name: 'Pro',
    price: 29,
    monthlyPrice: 29,
    annualPrice: 290, // ~17% discount (10 months price)
    
    // AI Limits
    aiRequestsPerDay: 100,
    tradingSignals: 'Unlimited',
    
    // Referral Commission (Viral Economics)
    commissionRates: {
      l1: 0.20,   // 20% direct
      l2: 0.10,   // 10% second level
      l3: 0.05,   // 5% third level
      l4: 0,      // 0% fourth level
      total: 0.35 // 35% total
    },
    
    // Features
    features: [
      '🚀 100 AI requests per day',
      '✨ Unlimited trading signals',
      '📊 Advanced technical analysis',
      '🔔 Real-time price alerts',
      '📈 Portfolio tracking',
      '💬 Priority support (24h response)',
      '🎯 AI-powered trade recommendations',
      '📱 Mobile app access',
    ],
    
    highlight: 'Most Popular',
    
    // Binh Pháp: 集中兵力 (Concentrate Forces) - Focus tier for most users
  },
  
  TRADER: {
    name: 'Trader',
    price: 97,
    monthlyPrice: 97,
    annualPrice: 970, // ~17% discount
    
    // AI Limits
    aiRequestsPerDay: 500,
    tradingSignals: 'Unlimited',
    
    // Referral Commission (Viral Economics)
    commissionRates: {
      l1: 0.25,   // 25% direct
      l2: 0.15,   // 15% second level
      l3: 0.10,   // 10% third level
      l4: 0.05,   // 5% fourth level
      total: 0.55 // 55% total
    },
    
    // Features
    features: [
      '⚡ 500 AI requests per day',
      '✨ Everything in Pro',
      '🤖 AI-powered auto-trading',
      '📊 Advanced portfolio analytics',
      '🔥 Copy trading from top traders',
      '💎 Exclusive trading strategies',
      '🎓 1-on-1 trading coaching',
      '⏰ Instant support (1h response)',
    ],
    
    highlight: 'Best Value',
    
    // Binh Pháp: 以戰養戰 (War Feeds War) - Commission starts earning significantly
  },
  
  ELITE: {
    name: 'Elite',
    price: 297,
    monthlyPrice: 297,
    annualPrice: 2970, // ~17% discount
    
    // AI Limits
    aiRequestsPerDay: Infinity, // Unlimited
    tradingSignals: 'Unlimited',
    
    // Referral Commission (Viral Economics - MAXIMUM)
    commissionRates: {
      l1: 0.30,   // 30% direct
      l2: 0.20,   // 20% second level
      l3: 0.15,   // 15% third level
      l4: 0.10,   // 10% fourth level
      total: 0.75 // 75% total (capped by 90% pool)
    },
    
    // Features
    features: [
      '♾️ Unlimited AI requests',
      '✨ Everything in Trader',
      '🏆 Dedicated account manager',
      '🔐 Private trading signals',
      '💰 Revenue share on referrals (30%)',
      '🎯 Custom AI models trained on your data',
      '📞 Direct phone support',
      '🌟 VIP community access',
    ],
    
    highlight: 'Premium',
    
    // Binh Pháp: 致人而不致於人 (Control Without Being Controlled) - Maximum leverage
  },
} as const;
```

---

## COMMISSION CALCULATION LOGIC (90% Pool Cap)

### Example Scenario:

**User Network**:
```
Alice (ELITE) 
  └─ Bob (PRO) [L1]
      └─ Carol (PRO) [L2]
          └─ David (FREE) [L3]
              └─ Eve (TRADER) [L4]
```

**When Eve (TRADER $97) pays**:
```
Alice earns from L4:
  L1: Bob pays $29 → Alice gets $29 × 30% = $8.7
  L2: Carol pays $29 → Alice gets $29 × 20% = $5.8
  L3: David pays $0 → Alice gets $0 × 15% = $0
  L4: Eve pays $97 → Alice gets $97 × 10% = $9.7
  
  Alice total: $24.2/month from network
```

**90% Pool Cap**:
```
Month total rebate pool: $10,000
Max commission allowed: $10,000 × 90% = $9,000

If calculated commissions = $12,000:
  Scaling factor = $9,000 / $12,000 = 0.75
  
Everyone's commission × 0.75
```

---

## TIER UPGRADE LOGIC (Auto-Promotion)

### Criteria for Auto-Upgrade:

**FREE → PRO**:
- Manual upgrade only (user must pay)

**PRO → TRADER** (Auto if eligible):
- 20+ active referrals (L1 direct)
- OR $5,000+ monthly trading volume
- OR 3 months consecutive PRO payment

**TRADER → ELITE** (Auto if eligible):
- 100+ active referrals (L1 direct)
- OR $50,000+ monthly trading volume
- OR $10,000+ commission earned in 1 month

**Retention Bonus**:
- Stay in paid tier for 12 months → +5% commission multiplier
- Stay for 24 months → +10% commission multiplier

---

## FILES TO UPDATE:

### 1. Delete/Archive (Conflicts):
- ❌ `src/config/payment-tiers.ts` (has FOUNDERS/PREMIUM wrong tiers)
- ❌ `src/lib/pricing-config.ts` (A/B testing variants outdated)

### 2. Create New (Unified):
- ✅ `src/config/unified-tiers.ts` (này là source of truth)

### 3. Update Existing:
- 🔄 `src/components/ai/PricingModal.tsx` - Import from unified-tiers
- 🔄 `src/lib/ai/rate-limiter.ts` - Use unified AI limits
- 🔄 `src/lib/viral-economics/*` - Use unified commission rates
- 🔄 CLI_PHASE5_CONTENT.txt - Reference unified tiers
- 🔄 CLI_PHASE6_VIRAL.txt - Reference unified commission

---

## BINH PHÁP MAPPING (4 Tiers):

| Tier | Price | Principle | Strategy |
|------|-------|-----------|----------|
| **FREE** | $0 | 試探 (Probe) | Attract users, no commitment |
| **PRO** | $29 | 集中兵力 (Concentrate) | Main revenue tier, 80% users here |
| **TRADER** | $97 | 以戰養戰 (War Feeds War) | Commission starts compounding |
| **ELITE** | $297 | 致人而不致於人 (Control) | Maximum leverage, whales |

---

## REVENUE PROJECTIONS (With Unified System):

### Month 6 (Conservative):
```
1,000 users:
- 700 FREE → $0
- 250 PRO → 250 × $29 = $7,250
- 40 TRADER → 40 × $97 = $3,880
- 10 ELITE → 10 × $297 = $2,970

Total MRR: $14,100
Commission paid (avg 30%): $4,230
Net revenue: $9,870
```

### Month 12 (Aggressive):
```
5,000 users:
- 3,000 FREE → $0
- 1,500 PRO → 1,500 × $29 = $43,500
- 400 TRADER → 400 × $97 = $38,800
- 100 ELITE → 100 × $297 = $29,700

Total MRR: $112,000
Commission paid (avg 35%): $39,200
Net revenue: $72,800
```

**90% pool ensures**: Max $100,800 commission (90% of $112K), so $39,200 is safe.

---

## NEXT STEPS (Em sẽ làm):

1. ✅ Create `src/config/unified-tiers.ts`
2. ✅ Update `PricingModal.tsx` to import unified
3. ✅ Update `rate-limiter.ts` to use unified limits
4. ✅ Update CLI Phase 5 & 6 to reference unified
5. ✅ Archive old configs
6. ✅ Run build test

**Anh approve để em bắt đầu không ạ?** 🎯
