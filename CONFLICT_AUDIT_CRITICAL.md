# 🚨 CONFLICT AUDIT REPORT - CRITICAL ISSUES FOUND

## ❌ VẤN ĐỀ PHÁT HIỆN

### 1. HARDCODED OLD PRICES (7 files)

**Files với giá cũ $49, $99**:
```
src/components/dashboard/UpgradeBanner.tsx:14
  ❌ message = "Unlock Wolf Pack automation & lifetime data for $99"
  
src/components/dashboard/LockedFeature.tsx:62
  ❌ "Unlock with Founders ($99)"
  
src/components/checkout/UpgradeModal.tsx:106
  ❌ ${tier === 'FOUNDERS' ? '49' : '99'}/mo
  
src/app/[locale]/offer/page.tsx:112
  ❌ <div className="text-4xl font-bold mb-6">$49<span>/mo</span></div>
  
src/app/[locale]/billing/page.tsx:40
  ❌ <p className="text-3xl font-bold text-blue-400">$99</p>
```

**ĐÚNG PHẢI LÀ**:
- PRO: $29 (không phải $49)
- TRADER: $97 (không phải $99)

---

### 2. VIRAL ECONOMICS - SAI COMMISSION RATES

**File**: `src/lib/viral-economics/tier-manager.ts`

**Hiện tại** (SAI):
```typescript
FREE: { commission: 0.05, ... }    // ❌ 5% - Sai!
BASIC: { commission: 0.10, ... }   // ❌ 10% - Tier không tồn tại
TRADER: { commission: 0.20, ... }  // ❌ 20% - Sai! (đúng là 55%)
PRO: { commission: 0.30, ... }     // ❌ 30% - Sai! (đúng là 35%)
ELITE: { commission: 0.40, ... }   // ❌ 40% - Sai! (đúng là 75%)
APEX: { commission: 0.50, ... }    // ❌ Tier không tồn tại
```

**PHẢI LÀ** (theo UNIFIED_TIERS):
```typescript
FREE: { commission: 0, ... }       // ✅ 0%
PRO: { commission: 0.35, ... }     // ✅ 35% (L1: 20%, L2: 10%, L3: 5%, L4: 0%)
TRADER: { commission: 0.55, ... }  // ✅ 55% (L1: 25%, L2: 15%, L3: 10%, L4: 5%)
ELITE: { commission: 0.75, ... }   // ✅ 75% (L1: 30%, L2: 20%, L3: 15%, L4: 10%)
```

---

### 3. CHECKOUT API - WRONG TIER NAMES

**File**: `src/app/api/checkout/route.ts:9`

```typescript
tier: z.enum(['FOUNDERS', 'PREMIUM']),  // ❌ OLD names
```

**PHẢI LÀ**:
```typescript
tier: z.enum(['FREE', 'PRO', 'TRADER', 'ELITE']),  // ✅ NEW names
```

---

### 4. PRICING MODAL - WRONG MAPPING

**File**: `src/components/ai/PricingModal.tsx:80`

```typescript
tier={selectedTier.toUpperCase() as 'FOUNDERS' | 'PREMIUM'}
```

**PHẢI LÀ**:
```typescript
tier={selectedTier.toUpperCase() as 'PRO' | 'TRADER' | 'ELITE'}
```

---

### 5. UPGRADE MODAL - OLD STRUCTURE

**File**: `src/components/checkout/UpgradeModal.tsx`

```typescript
Line 31: const [selectedTier, setSelectedTier] = useState<PaymentTier>('FOUNDERS');
Line 94: {(['FOUNDERS', 'PREMIUM'] as PaymentTier[]).map((tier) => (
Line 106: ${tier === 'FOUNDERS' ? '49' : '99'}/mo
```

**PHẢI LÀ**:
```typescript
Line 31: const [selectedTier, setSelectedTier] = useState<TierId>('PRO');
Line 94: {(['PRO', 'TRADER', 'ELITE'] as TierId[]).map((tier) => (
Line 106: ${UNIFIED_TIERS[tier].price}/mo
```

---

## 📋 SUMMARY TABLE

| Issue Type | Files Affected | Severity | Impact |
|------------|----------------|----------|--------|
| **Hardcoded Prices** | 5 | 🔴 HIGH | Users see wrong prices |
| **Commission Rates** | 1 | 🔴 CRITICAL | Referrals earn wrong amount |
| **Tier Names** | 3 | 🔴 HIGH | Checkout fails |
| **API Schema** | 1 | 🔴 HIGH | Backend validation errors |

---

## 🎯 FILES TO FIX (Priority Order)

### CRITICAL (Must fix now):
1. ❌ `src/lib/viral-economics/tier-manager.ts` - Commission rates
2. ❌ `src/lib/viral-economics/commission-calculator.ts` - Uses wrong rates
3. ❌ `src/app/api/checkout/route.ts` - API validation

### HIGH (Must fix before production):
4. ❌ `src/components/checkout/UpgradeModal.tsx` - Prices & tiers
5. ❌ `src/components/ai/PricingModal.tsx` - Tier mapping
6. ❌ `src/app/[locale]/offer/page.tsx` - Marketing page pricing
7. ❌ `src/app/[locale]/billing/page.tsx` - Billing page pricing

### MEDIUM (Should fix):
8. ❌ `src/components/dashboard/UpgradeBanner.tsx` - Banner pricing
9. ❌ `src/components/dashboard/LockedFeature.tsx` - Feature unlock pricing

---

## ✅ PROPOSED FIXES

### Fix 1: Update tier-manager.ts
```typescript
// Delete BASIC and APEX tiers
// Update commission rates to match UNIFIED_TIERS
import { UNIFIED_TIERS } from '@/config/unified-tiers';

const TIER_CONFIG = {
  FREE: { 
    commission: UNIFIED_TIERS.FREE.commissionRates.total,  // 0
    rebate: 0.60, 
    requirements: { referrals: 0, volume: 0 } 
  },
  PRO: { 
    commission: UNIFIED_TIERS.PRO.commissionRates.total,  // 0.35
    rebate: 0.60, 
    requirements: { referrals: 0, volume: 0 } 
  },
  TRADER: { 
    commission: UNIFIED_TIERS.TRADER.commissionRates.total,  // 0.55
    rebate: 0.55, 
    requirements: { referrals: 20, volume: 50000 } 
  },
  ELITE: { 
    commission: UNIFIED_TIERS.ELITE.commissionRates.total,  // 0.75
    rebate: 0.50, 
    requirements: { referrals: 100, volume: 500000 } 
  },
};
```

### Fix 2: Update checkout/route.ts
```typescript
const RequestSchema = z.object({
  tier: z.enum(['FREE', 'PRO', 'TRADER', 'ELITE']),  // NEW
  billingPeriod: z.enum(['monthly', 'annual']).optional(),
});
```

### Fix 3: Update UpgradeModal.tsx
```typescript
import { UNIFIED_TIERS, TierId } from '@/config/unified-tiers';

const [selectedTier, setSelectedTier] = useState<TierId>('PRO');

{(['PRO', 'TRADER', 'ELITE'] as TierId[]).map((tier) => (
  <div key={tier}>
    ${UNIFIED_TIERS[tier].price}/mo
  </div>
))}
```

---

## 🚨 BUSINESS IMPACT IF NOT FIXED

1. **Commission Wrong**: Users earn 5-40% instead of 0-75% → Lawsuit risk
2. **Pricing Wrong**: Show $49/$99 instead of $29/$97 → Revenue loss
3. **Checkout Fails**: Can't buy PRO/TRADER → 0 conversions
4. **Referrals Broken**: Commission calculation wrong → Trust loss

---

## ⚡ RECOMMENDED ACTION

**STOP EVERYTHING** - Fix these conflicts NOW before any CLI execution or deployment.

**Anh muốn em fix ngay lập tức không?**
