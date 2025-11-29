# CLI PHASE 22: THE AI HEDGE FUND (AUTONOMOUS AGENTS)

## Strategic Context: 奇正相生 (Use the Normal and the Extraordinary)

**Sun Tzu Principle**: "In battle, there are not more than two methods of attack: the direct and the indirect; yet these two in combination give rise to an endless series of maneuvers."

**Application**: 
- **Direct (Normal)**: Copy Trading (following humans).
- **Indirect (Extraordinary)**: AI Agents (following algorithms).
Combining both creates an unbeatable ecosystem.

**Objective**: Launch "Apex AI Fund" - Automated Wealth Management.
**Timeline**: Week 7 (2-3 days CLI execution)

---

## TASK 1: AI AGENT CORE

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_ai_agents.sql` (NEW)

```sql
CREATE TABLE ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- "Alpha Hunter", "Safe Haven"
  strategy_type TEXT NOT NULL, -- 'momentum', 'mean_reversion', 'sentiment'
  risk_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  description TEXT,
  total_aum NUMERIC DEFAULT 0, -- Assets Under Management
  performance_history JSONB, -- Chart data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Initial Agents
INSERT INTO ai_agents (name, strategy_type, risk_level, description) VALUES
('DeepSeek Alpha', 'sentiment', 'high', 'Trades based on news sentiment and whale movements.'),
('BitFlow Trend', 'momentum', 'medium', 'Follows strong trends on BTC/ETH.'),
('Stable Grid', 'mean_reversion', 'low', 'Farms volatility in stable ranges.');
```

### 1.2 Strategy Engines
**File**: `src/lib/ai/engines/momentum.ts` (NEW)
**File**: `src/lib/ai/engines/sentiment.ts` (NEW)

**Logic**:
- **Momentum**: Check RSI > 70 + Volume spike.
- **Sentiment**: Call OpenRouter (DeepSeek) to analyze news headlines.

---

## TASK 2: BACKTESTING ENGINE

### 2.1 Backtest API
**File**: `src/app/api/ai/backtest/route.ts` (NEW)

**Logic**:
- Input: Strategy ID, Timeframe (e.g., 30 days).
- Process: Run strategy logic against historical OHLCV data (Mocked or fetched from external API).
- Output: ROI, Max Drawdown, Sharpe Ratio.

### 2.2 UI Runner
**File**: `src/components/admin/agents/BacktestRunner.tsx` (NEW)

**Features**:
- Select Agent.
- "Run Simulation" button.
- Result Chart.

---

## TASK 3: AGENT MARKETPLACE

### 3.1 Marketplace Page
**File**: `src/app/[locale]/dashboard/ai-fund/page.tsx` (NEW)

**UI**:
- Grid of AI Agents.
- Stats Cards (AUM, ROI 30d).
- "Invest" button (Allocate Virtual Wallet funds).

### 3.2 Investment Logic
**File**: `src/app/api/ai/invest/route.ts` (NEW)

**Logic**:
- Deduct from User Wallet.
- Add to Agent AUM.
- Create `ai_investments` record.

---

## DELIVERABLES

1. ✅ **AI Brains**: 3 distinct trading strategies.
2. ✅ **Proof**: Backtesting tool to show "it works".
3. ✅ **Product**: Marketplace for users to deploy capital.

---

## EXECUTION COMMAND

```bash
Execute PHASE 22 (AI Hedge Fund)

Implement:
1. AI Agent Core (DB + Engines)
2. Backtesting Engine (API + UI)
3. Agent Marketplace

Quality:
- TypeScript strict mode
- Real-time AUM updates
- Build: 0 errors
```
