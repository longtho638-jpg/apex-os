# CLI PHASE 15: SIMULATION ARENA (PAPER TRADING)

## Strategic Context: 虛實相生 (The Virtual and the Real)

**Sun Tzu Principle**: "All warfare is based on deception. Hence, when we are able to attack, we must seem unable... Hold out baits to entice the enemy. Feign disorder, and crush him."

**Application**: We create a "Virtual Battlefield" (Paper Trading) where users can win safely. This builds confidence ("Trust") and addiction ("Engagement") before they deploy real capital ("The Real").

**Objective**: Increase User Activation (Signup -> First Action) by 50%.
**Timeline**: Week 5 (2-3 days CLI execution)

---

## TASK 1: VIRTUAL WALLET SYSTEM

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_simulation_arena.sql` (NEW)

```sql
CREATE TABLE virtual_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  balance NUMERIC DEFAULT 100000.00, -- $100k Start
  currency TEXT DEFAULT 'USDT',
  reset_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE virtual_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  symbol TEXT NOT NULL, -- BTC/USDT
  side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
  entry_price NUMERIC NOT NULL,
  size NUMERIC NOT NULL, -- Amount in USDT
  leverage INTEGER DEFAULT 1,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  pnl NUMERIC DEFAULT 0,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_virtual_positions_user ON virtual_positions(user_id);
```

### 1.2 Wallet API
**File**: `src/app/api/v1/trading/paper/portfolio/route.ts` (NEW)

**Logic**:
- GET: Fetch balance & open positions.
- POST (Reset): Reset balance to $100k (Limit 1 reset/week).

---

## TASK 2: TRADE SIMULATOR ENGINE

### 2.1 Execution API
**File**: `src/app/api/v1/trading/paper/execute/route.ts` (NEW)

**Logic**:
- **Open Position**:
  - Check Virtual Wallet balance.
  - Fetch Real-time Price (Mock or Exchange API).
  - Create `virtual_positions` record.
  - Deduct margin from Wallet (Locked funds).
- **Close Position**:
  - Calculate PnL: `(Exit - Entry) * Size * Leverage`.
  - Update Wallet Balance.
  - Mark position `CLOSED`.

### 2.2 Real-time PnL (Mock Calculation)
**File**: `src/components/trading/LivePositionTracker.tsx` (NEW)

**Features**:
- Auto-refresh prices every 5s.
- Show green/red PnL dynamically.
- "Close Position" button.

---

## TASK 3: PERFORMANCE ANALYTICS & LEADERBOARD

### 3.1 Analytics Dashboard
**File**: `src/components/trading/PortfolioAnalytics.tsx` (NEW)

**Metrics**:
- Win Rate (%).
- Total PnL ($).
- Best Trade / Worst Trade.

### 3.2 Leaderboard Page
**File**: `src/app/[locale]/leaderboard/paper-trading/page.tsx` (NEW)

**Logic**:
- Top 10 users by PnL (Weekly).
- Show: User Avatar, Win Rate, PnL.
- "Copy This Trader" button (Upsell feature).

---

## DELIVERABLES

1. ✅ **Virtual Wallet**: $100k playground for everyone.
2. ✅ **Simulation Engine**: Fast, bug-free execution.
3. ✅ **Gamification**: Leaderboard to drive competition.

---

## EXECUTION COMMAND

```bash
Execute PHASE 15 (Simulation Arena)

Implement:
1. Virtual Wallet (DB + API)
2. Trade Simulator (Execution Logic)
3. Portfolio Analytics & Leaderboard

Quality:
- TypeScript strict mode
- Real-time feel (Optimistic UI)
- Build: 0 errors
```
