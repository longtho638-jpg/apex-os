# CLI PHASE 30: THE SINGULARITY (AI HIVE MIND)

## Strategic Context: 天人合一 (Heaven and Man as One)

**Sun Tzu Principle**: "The clever combatant looks to the effect of combined energy, and does not require too much from individuals."

**Application**: We transcend individual bot performance. By aggregating the "decisions" of 10,000 bots and users, we create a **Superintelligence** (The Hive Mind) that is smarter than any single entity.

**Objective**: 99% System Uptime & "Set-and-Forget" Profitability.
**Timeline**: Week 10 (2-3 days CLI execution)

---

## TASK 1: GLOBAL SENTIMENT ENGINE (THE HIVE)

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_singularity.sql` (NEW)

```sql
CREATE TABLE hive_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  long_ratio NUMERIC NOT NULL, -- % of bots/users Long
  short_ratio NUMERIC NOT NULL, -- % of bots/users Short
  active_participants INTEGER NOT NULL,
  confidence_score NUMERIC NOT NULL, -- Based on historical accuracy of participants
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL, -- 'database', 'price_feed', 'execution'
  status TEXT NOT NULL, -- 'healthy', 'degraded', 'down'
  latency_ms INTEGER,
  action_taken TEXT, -- 'rerouted', 'restarted', 'notified'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Aggregator Cron
**File**: `src/app/api/cron/hive-mind/route.ts` (NEW)

**Logic**:
- Query all `virtual_positions` where status = 'OPEN'.
- Calculate Long/Short ratio per symbol.
- Weigh votes by User PnL (Smart Money vs Dumb Money).
- Store signal in `hive_signals`.

---

## TASK 2: SMART COPY (AUTO-ALLOCATION)

### 2.1 Rebalancer Logic
**File**: `src/lib/ai/singularity/rebalancer.ts` (NEW)

**Logic**:
- Find top 5 performing Agents (ROI 7d).
- Check User's "Smart Copy" settings (Risk tolerance).
- Automatically adjust `copy_relationships` allocation amounts.
- e.g., Move funds from "Slow Agent" to "Hot Agent".

### 2.2 Auto-Invest API
**File**: `src/app/api/ai/singularity/auto-invest/route.ts` (NEW)

**Logic**:
- Allow users to deposit into a "Singularity Fund" which uses the Rebalancer logic.

---

## TASK 3: SELF-HEALING MESH

### 3.1 Health Monitor Service
**File**: `src/lib/system/health-mesh.ts` (NEW)

**Logic**:
- Periodically ping critical external APIs (Binance, OpenRouter).
- If Primary fails -> Switch to Backup (e.g., Binance -> OKX data feed).
- Log incident to `system_health_logs`.

### 3.2 Dashboard Widget
**File**: `src/components/dashboard/SystemHealthMesh.tsx` (NEW)

**UI**:
- Visual node graph of system components.
- Real-time status indicators (Green/Red).
- "Self-Healing Active" badge.

---

## DELIVERABLES

1. ✅ **Hive Mind**: Crowd wisdom indicators.
2. ✅ **Auto-Pilot**: Dynamic fund management.
3. ✅ **Immortality**: Automated failover system.

---

## EXECUTION COMMAND

```bash
Execute PHASE 30 (The Singularity)

Implement:
1. Hive Mind Aggregator (DB + Cron)
2. Smart Copy Rebalancer
3. Self-Healing Mesh

Quality:
- TypeScript strict mode
- High Availability architecture
- Build: 0 errors
```
