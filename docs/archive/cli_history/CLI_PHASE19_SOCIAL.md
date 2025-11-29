# CLI PHASE 19: SOCIAL TRADING (THE COPY-TRADE ENGINE)

## Strategic Context: 借屍還魂 (Borrow a Corpse to Resurrect the Soul)

**Sun Tzu Principle**: "Make use of what is useless (or passive users) by giving them a purpose (copying winners)."

**Application**: 90% of users lose money. Instead of letting them churn, we let them copy the top 10% winners. Everyone wins: Winners get commission, Losers get profit, Platform gets volume.

**Objective**: 50% of volume from Copy Trading.
**Timeline**: Week 6 (2-3 days CLI execution)

---

## TASK 1: FOLLOWER SYSTEM

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_social_trading.sql` (NEW)

```sql
CREATE TABLE copy_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id),
  leader_id UUID REFERENCES users(id),
  allocation_amount NUMERIC NOT NULL, -- Amount to dedicate to this leader
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  profit_sharing_rate NUMERIC DEFAULT 0.10, -- 10%
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, leader_id)
);

CREATE TABLE copy_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES copy_relationships(id),
  original_order_id UUID, -- Reference to Leader's order
  symbol TEXT NOT NULL,
  side TEXT NOT NULL,
  entry_price NUMERIC,
  size NUMERIC,
  pnl NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Follow API
**File**: `src/app/api/social/follow/route.ts` (NEW)

**Logic**:
- User selects Leader.
- Allocates budget (e.g., $1000).
- Creates `copy_relationships` record.

---

## TASK 2: SIGNAL BROADCASTER (REAL-TIME REPLICATION)

### 2.1 Broadcaster Logic
**File**: `src/lib/trading/broadcaster.ts` (NEW)

**Logic**:
- Triggered when a Leader executes a trade (hook into `execute` API from Phase 15).
- Find all active followers.
- Calculate size pro-rata (if Leader uses 10% of portfolio, Follower uses 10% of allocation).
- Execute trades for followers (Async batching).

### 2.2 Update Trade Execution
**File**: `src/app/api/v1/trading/paper/execute/route.ts` (MODIFY)

- Inject `broadcastSignal(userId, order)` after successful leader trade.

---

## TASK 3: CREATOR ECONOMY (PROFIT SHARING)

### 3.1 PnL Settlement
**File**: `src/lib/trading/settlement.ts` (NEW)

**Logic**:
- When a copy position closes with profit:
  - Calculate 10% fee.
  - Deduct from Follower's profit.
  - Add to Leader's wallet (Pending Vault).

---

## DELIVERABLES

1. ✅ **Follow System**: "Copy" button on Leaderboard working.
2. ✅ **Broadcaster**: 1 Leader trade = N Follower trades.
3. ✅ **Profit Share**: Automatic fee distribution.

---

## EXECUTION COMMAND

```bash
Execute PHASE 19 (Social Trading)

Implement:
1. Follower System (DB + API)
2. Signal Broadcaster (Logic + Integration)
3. Profit Sharing Settlement

Quality:
- TypeScript strict mode
- Performance optimized (Batch inserts)
- Build: 0 errors
```
