# CLI PHASE 24: THE TOKEN LAUNCHPAD (IDO ENGINE)

## Strategic Context: 樹上開花 (Deck the Tree with False Blossoms)

**Sun Tzu Principle**: "Create something from nothing. Make the situation look more powerful than it is."

**Application**: We create a high-end Launchpad interface to signal legitimacy and high demand ("FOMO"), encouraging investors to participate early in the APEX token sale.

**Objective**: Raise $500k in Presale.
**Timeline**: Week 8 (2-3 days CLI execution)

---

## TASK 1: PRESALE DASHBOARD

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_token_presale.sql` (NEW)

```sql
CREATE TABLE presale_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'Seed', 'Private', 'Public'
  price NUMERIC NOT NULL, -- $0.05
  token_allocation NUMERIC NOT NULL,
  tokens_sold NUMERIC DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'upcoming'
);

CREATE TABLE presale_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  round_id UUID REFERENCES presale_rounds(id),
  amount_usdt NUMERIC NOT NULL,
  token_amount NUMERIC NOT NULL,
  tx_hash TEXT NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_amount NUMERIC DEFAULT 0
);
```

### 1.2 Dashboard UI
**File**: `src/app/[locale]/launchpad/page.tsx` (NEW)

**Features**:
- **Countdown Timer**: To next round or end of sale.
- **Progress Bar**: "75% Sold" (Create scarcity).
- **Purchase Widget**: Input USDT -> Output APEX.

---

## TASK 2: PURCHASE LOGIC (WEB3)

### 2.1 Purchase Hook
**File**: `src/hooks/usePresale.ts` (NEW)

**Logic**:
- Integrate with `wagmi` to call Smart Contract `buyTokens()`.
- *Simulation Mode*: If contract not deployed, simulate transaction success and update DB.

### 2.2 Transaction Recorder API
**File**: `src/app/api/launchpad/record-purchase/route.ts` (NEW)

**Logic**:
- Receive `txHash` from frontend.
- Verify transaction (Simulated or real).
- Record in `presale_purchases`.

---

## TASK 3: CLAIM PORTAL

### 3.1 Vesting Logic
**File**: `src/lib/finance/vesting.ts` (NEW)

**Logic**:
- Calculate claimable tokens based on `purchased_at` and round rules (e.g., 10% TGE, linear 12 months).

### 3.2 Claim UI
**File**: `src/components/launchpad/ClaimWidget.tsx` (NEW)

**UI**:
- "Available to Claim: 500 APEX".
- "Next Unlock: 12 Days".
- "Claim" button.

---

## DELIVERABLES

1. ✅ **Presale Page**: High-converting landing page for the token.
2. ✅ **Buy Engine**: Accepts crypto for tokens.
3. ✅ **Vesting System**: Manages token release.

---

## EXECUTION COMMAND

```bash
Execute PHASE 24 (Token Launchpad)

Implement:
1. Presale Dashboard (DB + UI)
2. Purchase Logic (Web3 Hook + API)
3. Claim Portal (Vesting Logic + UI)

Quality:
- TypeScript strict mode
- Web3 Integration
- Build: 0 errors
```
