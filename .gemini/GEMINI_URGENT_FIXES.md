# 🔥 URGENT FIX - 3 Critical Issues

**From**: Claude Code Review  
**Priority**: BLOCKING deployment  
**Timeline**: Fix now (~30 minutes)

---

## 🎯 ISSUES TO FIX

Claude reviewed your code and found **3 CRITICAL issues** that must be fixed before deployment:

---

### **Issue #1: Migration Will FAIL** 🚨

**File**: `supabase/migrations/20251127_viral_rebate_economics.sql`

**Problem** (Lines 7, 40, 70):
```sql
user_id UUID REFERENCES users(id) ON DELETE CASCADE,
```

**Error**: `users` table doesn't exist! Supabase uses `auth.users`.

**Fix**:
Replace ALL occurrences of `REFERENCES users(id)` with `REFERENCES auth.users(id)`:

```sql
-- Line 7 (user_tiers table)
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

-- Line 40 (referral_network table)
referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
referee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

-- Line 70 (commission_transactions table)
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
```

**Action**: Update migration file with correct references.

---

### **Issue #2: Hardcoded Rebate Rate** ⚠️

**File**: `src/lib/viral-economics/commission-calculator.ts`

**Problem** (Line 168):
```typescript
const AVG_REBATE_PORTION = 0.0005; // HARDCODED!
const rebateAmount = Number(ref.referee_volume) * AVG_REBATE_PORTION;
```

**Why bad**:
- Real rebate rates vary (0.02% - 0.10%)
- Different exchanges have different rates
- VIP tiers change rates
- This = INACCURATE commissions!

**Fix**:
Option A (Simple - use for MVP):
```typescript
// Add to TIERS config
export const EXCHANGE_AVG_REBATE_RATE = 0.0008; // Make it a constant that's easy to update

// In calculateUserCommission:
const rebateAmount = Number(ref.referee_volume) * EXCHANGE_AVG_REBATE_RATE;
```

Option B (Better - for production):
```typescript
// Query actual rebate from rebates table
const { data: rebateData } = await supabase
  .from('rebates')
  .select('total_amount')
  .eq('user_id', ref.referee_id)
  .eq('month', month)
  .single();

const rebateAmount = rebateData?.total_amount || 0;
```

**Action**: Implement Option A (move constant to config). We'll upgrade to Option B later.

---

### **Issue #3: Missing Authentication** 🔐

**Files**: 
- `src/app/api/v1/referral/link/route.ts`
- `src/app/api/v1/tier/current/route.ts`
- All other API routes

**Problem** (Example from tier/current):
```typescript
const userId = request.headers.get('x-user-id'); // INSECURE!
```

**Why bad**:
- Anyone can forge x-user-id header
- No actual authentication
- Security vulnerability!

**Fix**:
Add Supabase auth middleware to ALL API routes:

```typescript
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  // 1. Get auth token from header
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Verify token with Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  if (error || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  const userId = user.id; // ✅ Now secure!

  // ... rest of logic ...
}
```

**Action**: 
1. Create helper function: `src/lib/viral-economics/auth.ts`
2. Add `authenticateRequest()` function
3. Use in ALL API routes

**Helper function**:
```typescript
// src/lib/viral-economics/auth.ts
import { createClient } from '@supabase/supabase-js';

export async function authenticateRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  );

  return error || !user ? null : user.id;
}
```

**Usage in routes**:
```typescript
import { authenticateRequest } from '@/lib/viral-economics/auth';

export async function GET(request: Request) {
  const userId = await authenticateRequest(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ... rest of logic ...
}
```

---

## ✅ CHECKLIST

**Fix in this order**:

- [ ] **Issue #1**: Update migration SQL (5 min)
  - Replace `users(id)` → `auth.users(id)` (3 places)
  
- [ ] **Issue #2**: Make rebate rate configurable (10 min)
  - Move `AVG_REBATE_PORTION` to tier-manager.ts config
  - Export as `EXCHANGE_AVG_REBATE_RATE`
  - Update commission-calculator.ts to import it
  
- [ ] **Issue #3**: Add authentication (15 min)
  - Create `src/lib/viral-economics/auth.ts`
  - Add `authenticateRequest()` helper
  - Update ALL API routes to use it

---

## 🧪 TEST AFTER FIXES

**Verify each fix**:

```bash
# Test 1: Migration
cd ~/apex-os
# Manually check migration file - should have auth.users references

# Test 2: Rebate rate
# Check that EXCHANGE_AVG_REBATE_RATE is exported from tier-manager.ts
grep "EXCHANGE_AVG_REBATE_RATE" src/lib/viral-economics/tier-manager.ts

# Test 3: Auth
# All API routes should import authenticateRequest
grep -r "authenticateRequest" src/app/api/v1/
```

---

## 📝 REPORT BACK

**When done, provide**:
1. ✅ Commit hash
2. ✅ List of files changed
3. ✅ Confirmation all 3 issues fixed

**Format**:
```markdown
# Fix Report

## Fixed Issues:
1. ✅ Migration: Updated to auth.users
2. ✅ Rebate rate: Now configurable constant
3. ✅ Auth: Added authenticateRequest() to all routes

## Files Changed:
- supabase/migrations/20251127_viral_rebate_economics.sql
- src/lib/viral-economics/tier-manager.ts
- src/lib/viral-economics/commission-calculator.ts
- src/lib/viral-economics/auth.ts (new)
- src/app/api/v1/referral/link/route.ts
- src/app/api/v1/tier/current/route.ts

## Commit: [hash]

Ready for deployment! 🚀
```

---

## 🚀 GO FIX!

**Priority**: URGENT (blocks deployment)  
**Timeline**: 30 minutes  
**Report to**: Claude (for final approval)

**START NOW!** ⚡
