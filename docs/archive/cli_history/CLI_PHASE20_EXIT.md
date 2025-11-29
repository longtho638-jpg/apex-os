# CLI PHASE 20: FOUNDER'S WAR ROOM (EXIT PREP)

## Strategic Context: 功成身退 (Retire After Success)

**Sun Tzu Principle**: "He who knows when to fight and when not to fight will be victorious."

**Application**: Building is the fight. Exiting is the victory. This phase is about preparing the "Escape Pod" with maximum value.

**Objective**: Visualize Wealth & Prepare for Liquidity Event.
**Timeline**: Week 6 (2-3 days CLI execution)

---

## TASK 1: CAP TABLE TRACKER

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_cap_table.sql` (NEW)

```sql
CREATE TABLE equity_holders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('founder', 'investor', 'employee', 'advisor')),
  shares_owned NUMERIC NOT NULL,
  vesting_start TIMESTAMPTZ,
  cliff_months INTEGER,
  vesting_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_valuation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valuation_date TIMESTAMPTZ DEFAULT NOW(),
  pre_money_valuation NUMERIC,
  share_price NUMERIC,
  total_shares NUMERIC
);
```

### 1.2 Admin UI
**File**: `src/app/[locale]/admin/finance/cap-table/page.tsx` (NEW)

**Features**:
- Pie Chart: Share distribution.
- Table: Stakeholders & Vesting status.

---

## TASK 2: TOKENOMICS DASHBOARD

### 2.1 Token Config
**File**: `src/config/tokenomics.ts` (NEW)

```typescript
export const APEX_TOKENOMICS = {
  totalSupply: 1_000_000_000,
  allocations: {
    team: 0.20,
    investors: 0.15,
    community: 0.40, // Airdrop/Rewards
    treasury: 0.25
  }
};
```

### 2.2 Dashboard UI
**File**: `src/app/[locale]/admin/finance/tokenomics/page.tsx` (NEW)

**Features**:
- Visualize allocation.
- Simulate Token Price vs Market Cap.
- "Community Rewards" pool tracking (from Phase 15 & 19).

---

## TASK 3: EXIT CALCULATOR

### 3.1 Calculator Tool
**File**: `src/components/admin/ExitCalculator.tsx` (NEW)

**Inputs**:
- Exit Valuation ($10M - $1B).
- Your Equity (%).
- Tax Rate (%).

**Outputs**:
- Net Cashout.
- "Freedom Date" (How long until financial freedom based on burn rate).

---

## DELIVERABLES

1. ✅ **Cap Table**: Who owns what.
2. ✅ **Token Plan**: Crypto wealth visualization.
3. ✅ **Payday Simulator**: The light at the end of the tunnel.

---

## EXECUTION COMMAND

```bash
Execute PHASE 20 (Founder's War Room)

Implement:
1. Cap Table Tracker (DB + UI)
2. Tokenomics Dashboard
3. Exit Calculator Component

Quality:
- Confidentiality: Admin Only (Strict middleware check)
- Build: 0 errors
```
