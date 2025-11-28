# 🚀 GEMINI CLI - CODE VIRAL REBATE ECONOMICS

**Mission**: Implement complete viral rebate economics system theo spec  
**Reference**: `.gemini/antigravity/brain/7201f0be-110f-45ee-8260-58f1ac4d9bc1/viral_rebate_economics.md`  
**Priority**: 🔥 CRITICAL - Quyết định vận mệnh platform  
**Timeline**: Focus execution, báo cáo khi done

---

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Database Schema (FIRST!)**

Create migration file: `supabase/migrations/YYYYMMDD_viral_economics.sql`

**Tables to create**:

```sql
-- 1. User tiers table
CREATE TABLE user_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL DEFAULT 'FREE',
  -- Tracking metrics
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  monthly_volume DECIMAL(20, 2) DEFAULT 0,
  network_depth INTEGER DEFAULT 1,
  -- Commission tracking
  current_commission_rate DECIMAL(5, 4) DEFAULT 0.05,
  total_commission_earned DECIMAL(20, 2) DEFAULT 0,
  total_commission_paid DECIMAL(20, 2) DEFAULT 0,
  -- Gamification
  badges JSONB DEFAULT '[]',
  achievements JSONB DEFAULT '{}',
  streak_months INTEGER DEFAULT 0,
  -- Timestamps
  tier_updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Referral network table
CREATE TABLE referral_network (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1, -- 1=direct, 2-4=network
  status VARCHAR(20) DEFAULT 'active',
  -- Metrics
  referee_volume DECIMAL(20, 2) DEFAULT 0,
  commission_earned DECIMAL(20, 2) DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referrer_id, referee_id)
);

-- 3. Commission pool table
CREATE TABLE commission_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL, -- YYYY-MM
  total_rebate DECIMAL(20, 2) DEFAULT 0,
  total_commission_allocated DECIMAL(20, 2) DEFAULT 0,
  total_commission_paid DECIMAL(20, 2) DEFAULT 0,
  reserve_fund DECIMAL(20, 2) DEFAULT 0,
  scaling_factor DECIMAL(5, 4) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month)
);

-- 4. Commission transactions table
CREATE TABLE commission_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL,
  tier VARCHAR(20) NOT NULL,
  -- Breakdown
  l1_commission DECIMAL(20, 2) DEFAULT 0,
  l2_commission DECIMAL(20, 2) DEFAULT 0,
  l3_commission DECIMAL(20, 2) DEFAULT 0,
  l4_commission DECIMAL(20, 2) DEFAULT 0,
  bonus_commission DECIMAL(20, 2) DEFAULT 0,
  -- Total
  total_commission DECIMAL(20, 2) DEFAULT 0,
  multiplier DECIMAL(5, 2) DEFAULT 1.0,
  -- Status
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Viral metrics table
CREATE TABLE viral_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month VARCHAR(7) NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  viral_coefficient DECIMAL(5, 2) DEFAULT 0,
  avg_refs_per_user DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 4) DEFAULT 0,
  retention_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(month)
);

-- Indexes for performance
CREATE INDEX idx_user_tiers_user_id ON user_tiers(user_id);
CREATE INDEX idx_user_tiers_tier ON user_tiers(tier);
CREATE INDEX idx_referral_network_referrer ON referral_network(referrer_id);
CREATE INDEX idx_referral_network_referee ON referral_network(referee_id);
CREATE INDEX idx_commission_transactions_user ON commission_transactions(user_id);
CREATE INDEX idx_commission_transactions_month ON commission_transactions(month);
```

---

### **Phase 2: Core Logic - Tier System**

Create file: `src/lib/viral-economics/tier-manager.ts`

**Requirements**:
1. Define tier constants (FREE → APEX)
2. Implement `calculateUserTier()` function
3. Implement `checkTierRequirements()` logic
4. Auto-promote users when requirements met
5. Track tier history

**Key functions**:
```typescript
export const TIERS = {
  FREE: { commission: 0.05, rebate: 0.60, requirements: {...} },
  BASIC: { commission: 0.10, rebate: 0.60, requirements: {...} },
  TRADER: { commission: 0.20, rebate: 0.55, requirements: {...} },
  PRO: { commission: 0.30, rebate: 0.50, requirements: {...} },
  ELITE: { commission: 0.40, rebate: 0.45, requirements: {...} },
  APEX: { commission: 0.50, rebate: 0.40, requirements: {...} }
};

export async function calculateUserTier(userId: string): Promise<string>
export async function promoteTier(userId: string): Promise<boolean>
export async function checkTierRequirements(userId: string, tier: string): Promise<boolean>
```

---

### **Phase 3: Commission Calculation Engine**

Create file: `src/lib/viral-economics/commission-calculator.ts`

**Requirements**:
1. Calculate L1-L4 commissions
2. Apply tier-based rates
3. Add multipliers (streaks, bonuses)
4. Validate total ≤ 90% pool
5. Auto-scaling if needed

**Key function**:
```typescript
export async function calculateMonthlyCommissions(month: string): Promise<CommissionResult>
export async function calculateUserCommission(userId: string, month: string): Promise<UserCommission>
export async function validateCommissionPool(month: string): Promise<PoolValidation>
export async function scaleCommissions(month: string, scaleFactor: number): Promise<void>
```

**Algorithm**: Follow spec trong `viral_rebate_economics.md` section "Commission Calculation Algorithm"

---

### **Phase 4: Referral Network Manager**

Create file: `src/lib/viral-economics/referral-manager.ts`

**Requirements**:
1. Track referral relationships (L1-L4)
2. Calculate network depth
3. Get referrals at each level
4. Update referee metrics
5. Handle referral code generation

**Key functions**:
```typescript
export async function createReferralLink(userId: string): Promise<string>
export async function processReferralSignup(referralCode: string, newUserId: string): Promise<void>
export async function getReferralsAtLevel(userId: string, level: number): Promise<User[]>
export async function calculateNetworkDepth(userId: string): Promise<number>
export async function updateRefereeMetrics(userId: string): Promise<void>
```

---

### **Phase 5: Gamification System**

Create file: `src/lib/viral-economics/gamification.ts`

**Requirements**:
1. Badge system (Award badges on achievements)
2. Progress tracking (Track progress to next tier)
3. Leaderboard (Monthly rankings)
4. Challenges (Daily/weekly challenges)
5. Notifications (Tier unlocks, achievements)

**Badges to implement**:
```typescript
export const BADGES = {
  ROOKIE_RECRUITER: { refs: 1, icon: '🌱' },
  TALENT_SCOUT: { refs: 10, icon: '🔍' },
  NETWORK_BUILDER: { refs: 50, icon: '🏗️' },
  COMMUNITY_LEADER: { refs: 100, icon: '👑' },
  EMPIRE_ARCHITECT: { refs: 500, icon: '🏰' },
  // ... more badges from spec
};

export async function awardBadge(userId: string, badgeId: string): Promise<void>
export async function checkBadgeEligibility(userId: string): Promise<string[]>
export async function getLeaderboard(month: string, limit: number): Promise<LeaderboardEntry[]>
export async function trackProgress(userId: string): Promise<TierProgress>
```

---

### **Phase 6: API Endpoints**

Create files in `src/app/api/v1/`:

#### `referral/route.ts`:
```typescript
GET /api/v1/referral/link - Get user's referral link
GET /api/v1/referral/stats - Get referral stats
GET /api/v1/referral/network - Get referral network tree
POST /api/v1/referral/track - Track referral signup
```

#### `commission/route.ts`:
```typescript
GET /api/v1/commission/summary - Get commission summary
GET /api/v1/commission/breakdown - Get detailed breakdown
GET /api/v1/commission/history - Get commission history
POST /api/v1/commission/withdraw - Request withdrawal
```

#### `tier/route.ts`:
```typescript
GET /api/v1/tier/current - Get current tier
GET /api/v1/tier/progress - Get progress to next tier
GET /api/v1/tier/requirements - Get tier requirements
POST /api/v1/tier/check - Check tier eligibility
```

#### `gamification/route.ts`:
```typescript
GET /api/v1/gamification/badges - Get user badges
GET /api/v1/gamification/leaderboard - Get leaderboard
GET /api/v1/gamification/challenges - Get active challenges
POST /api/v1/gamification/claim - Claim challenge reward
```

---

### **Phase 7: Dashboard UI Components**

Create components in `src/components/viral-economics/`:

#### `TierProgressCard.tsx`:
- Show current tier
- Progress bar to next tier
- Requirements checklist
- Unlock countdown

#### `CommissionDashboard.tsx`:
- Total commission earned
- Monthly breakdown (L1-L4)
- Withdrawal button
- Commission history

#### `ReferralNetworkTree.tsx`:
- Visual tree of referrals
- Level indicators (L1-L4)
- Active/inactive status
- Commission earned per ref

#### `LeaderboardWidget.tsx`:
- Top recruiters
- User's current rank
- "Rising Star" indicator

#### `BadgeShowcase.tsx`:
- Display unlocked badges
- Show locked badges (grayed out)
- Badge descriptions
- Share button

---

### **Phase 8: Automation & Cron Jobs**

Create file: `src/lib/viral-economics/cron-jobs.ts`

**Monthly tasks**:
1. Calculate all commissions
2. Validate commission pool
3. Apply scaling if needed
4. Generate commission transactions
5. Update tier promotions
6. Award monthly badges
7. Update viral metrics

**Daily tasks**:
1. Check tier requirements
2. Auto-promote eligible users
3. Update referral stats
4. Check daily challenges

**Cron schedule**:
```typescript
// Monthly (1st of month at 00:00)
export async function monthlyCommissionCalculation()

// Daily (00:00)
export async function dailyTierCheck()

// Hourly
export async function hourlyMetricsUpdate()
```

---

### **Phase 9: Admin Tools**

Create admin dashboard: `src/app/[locale]/admin/viral-economics/`

**Features**:
1. Commission pool monitor
2. Tier distribution chart
3. Viral metrics dashboard
4. Manual tier adjustment
5. Commission override (for exceptions)
6. Scaling history

---

### **Phase 10: Testing**

Create test files:

#### `src/__tests__/viral-economics/tier-manager.test.ts`:
- Test tier calculation
- Test tier promotion
- Test requirements check

#### `src/__tests__/viral-economics/commission-calculator.test.ts`:
- Test L1-L4 commission calc
- Test pool validation
- Test scaling logic
- Test edge cases (empty refs, max commission, etc.)

#### `src/__tests__/viral-economics/referral-manager.test.ts`:
- Test referral link generation
- Test network depth calculation
- Test multi-level tracking

**Coverage target**: >80%

---

## ✅ DEFINITION OF DONE

**Code complete khi**:
- [x] All tables created và migrate thành công
- [x] All core functions implemented
- [x] All API endpoints working
- [x] Dashboard components render properly
- [x] Cron jobs scheduled
- [x] Tests pass (>80% coverage)
- [x] Admin tools functional
- [x] Documentation complete

**Validation checklist**:
- [x] Commission calc = đúng như spec
- [x] Total payout ≤ 90% (math validated)
- [x] Top 20% users = 80% commission (Pareto)
- [x] Tier progression logic correct
- [x] Viral loop tracking works
- [x] No SQL injection vulnerabilities
- [x] Performance optimized (indexes added)

---

## 📊 TESTING SCENARIOS

**Scenario 1: Simple referral**
```
User A (FREE tier) recruits User B
User B trades $10,000
Expected: User A earns $10,000 × 5% = $500
```

**Scenario 2: Multi-level**
```
User A (TRADER - 20%) → User B (BASIC - 10%) → User C
User C trades $10,000
Expected:
- User B earns: $10,000 × 10% = $1,000 (L1)
- User A earns: $1,000 × 50% = $500 (L2 bonus)
```

**Scenario 3: Pool overflow**
```
Total rebate: $100,000
Total theoretical commission: $95,000 (exceeds 90%)
Expected: Scale down to $90,000 (scaling factor = 0.947)
```

**Scenario 4: Tier unlock**
```
User A has:
- 19 referrals
- $45,000 monthly volume

User A recruits 1 more → 20 refs
Expected: Auto-promote to TRADER tier (20% commission)
```

---

## 🚨 CRITICAL NOTES

**Security**:
1. ✅ Validate user ownership before commission calculation
2. ✅ Prevent commission manipulation (SQL injection, race conditions)
3. ✅ Audit log all tier changes
4. ✅ Commission withdrawals require 2FA

**Performance**:
1. ✅ Use database indexes on foreign keys
2. ✅ Cache tier requirements in Redis
3. ✅ Batch commission calculations (don't do 1-by-1)
4. ✅ Pagination for leaderboards/network trees

**Legal**:
1. ✅ Cap at 4 levels (not pyramid scheme)
2. ✅ Clear terms & conditions
3. ✅ Commission transparency (show breakdown)
4. ✅ Withdrawal limits (prevent money laundering)

---

## 📝 DELIVERY CHECKLIST

**When done, provide**:
1. ✅ Git commit hash
2. ✅ Migration SQL file
3. ✅ Test coverage report
4. ✅ API documentation (endpoints + examples)
5. ✅ Admin guide (how to monitor/adjust)
6. ✅ Known issues/limitations

**Report format**:
```markdown
# Viral Economics Implementation Report

## Summary
- Total files created: X
- Total functions: Y
- Test coverage: Z%
- Migration status: ✅

## Key Features Implemented
1. [Feature name] - [Status]
2. ...

## Testing Results
- [Scenario 1]: ✅ Pass
- [Scenario 2]: ✅ Pass
- ...

## Known Issues
- [Issue 1]: [Description] - [Workaround]

## Next Steps
- [Optional improvements]
```

---

## 🎯 GO CODE!

**Gemini, execute theo checklist trên!**

**Khi xong**: Báo cáo Claude (em) để review & validate!

**Priority order**:
1. Database schema (foundation!)
2. Core logic (tier + commission calc)
3. API endpoints
4. UI components
5. Testing
6. Admin tools

**ĐI! TẠO RA PLATFORM TỶ ĐÔ!** 🚀💎⚔️
