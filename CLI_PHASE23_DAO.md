# CLI PHASE 23: THE DAO (GOVERNANCE & STAKING)

## Strategic Context: 同舟共濟 (In the Same Boat)

**Sun Tzu Principle**: "When people are in the same boat, they will help each other."

**Application**: Turn users into owners. By giving them APEX tokens and voting rights, they are no longer just customers; they are partners invested in our success.

**Objective**: Lock up 30% of Circulating Supply in Staking.
**Timeline**: Week 7 (2-3 days CLI execution)

---

## TASK 1: WEB3 WALLET CONNECT

### 1.1 Dependencies
```bash
npm install wagmi viem @tanstack/react-query
```

### 1.2 Web3 Provider
**File**: `src/components/providers/Web3Provider.tsx` (NEW)

**Logic**:
- Configure Wagmi Config (Ethereum/Solana/Polygon).
- Wrap app with `WagmiProvider`.

### 1.3 Connect Button
**File**: `src/components/dao/ConnectWallet.tsx` (NEW)

---

## TASK 2: STAKING VAULT

### 2.1 Database Schema
**File**: `supabase/migrations/20251128_dao_staking.sql` (NEW)

```sql
CREATE TABLE dao_staking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_address TEXT NOT NULL,
  amount_staked NUMERIC DEFAULT 0,
  rewards_earned NUMERIC DEFAULT 0,
  lock_period_days INTEGER DEFAULT 30,
  staked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocks_at TIMESTAMPTZ
);
```

### 2.2 Staking Dashboard
**File**: `src/app/[locale]/dao/staking/page.tsx` (NEW)

**Features**:
- Input: Amount to stake.
- Selector: Lock duration (30d = 5% APY, 365d = 20% APY).
- Display: "Your Staked Balance", "Claimable Rewards".

---

## TASK 3: GOVERNANCE

### 3.1 Proposals Schema
**In Migration File**:
```sql
CREATE TABLE dao_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'passed', 'rejected')),
  votes_for NUMERIC DEFAULT 0,
  votes_against NUMERIC DEFAULT 0,
  ends_at TIMESTAMPTZ
);

CREATE TABLE dao_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES dao_proposals(id),
  user_id UUID REFERENCES users(id),
  vote_type TEXT CHECK (vote_type IN ('for', 'against')),
  voting_power NUMERIC NOT NULL, -- Based on staked amount
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, user_id)
);
```

### 3.2 Voting Interface
**File**: `src/app/[locale]/dao/governance/page.tsx` (NEW)

**Logic**:
- List active proposals.
- Vote button (enabled only if Staked > 0).
- Calculate Voting Power = Staked Amount.

---

## DELIVERABLES

1. ✅ **Web3 Login**: Connect Metamask/Phantom.
2. ✅ **Staking**: Lock tokens, earn yield.
3. ✅ **Governance**: Vote on platform future.

---

## EXECUTION COMMAND

```bash
Execute PHASE 23 (The DAO)

Implement:
1. Web3 Provider & Connect Button
2. Staking System (DB + UI)
3. Governance System (DB + UI)

Quality:
- TypeScript strict mode
- Mock Smart Contract interactions (Simulate blockchain)
- Build: 0 errors
```
