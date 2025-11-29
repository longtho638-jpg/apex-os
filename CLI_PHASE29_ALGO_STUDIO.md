# CLI PHASE 29: THE ALGO STUDIO (NO-CODE QUANT)

## Strategic Context: 運籌帷幄 (Strategic Planning)

**Sun Tzu Principle**: "The general who wins a battle makes many calculations in his temple ere the battle is fought."

**Application**: Empower users to be their own generals. By giving them a "War Room" (Algo Studio) to design strategies visually, we lock them into our ecosystem. They build *their* IP on *our* platform.

**Objective**: Enable Non-Coders to build Quant Strategies.
**Timeline**: Week 9 (2-3 days CLI execution)

---

## TASK 1: INFRASTRUCTURE

### 1.1 Dependencies
```bash
npm install @xyflow/react
```

### 1.2 Database Schema
**File**: `supabase/migrations/20251128_algo_studio.sql` (NEW)

```sql
CREATE TABLE user_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  graph_data JSONB NOT NULL, -- React Flow nodes/edges
  compiled_config JSONB, -- Executable logic
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## TASK 2: VISUAL CANVAS

### 2.1 Editor Page
**File**: `src/app/[locale]/studio/editor/page.tsx` (NEW)

**Layout**:
- **Sidebar**: Draggable blocks (Indicators, Logic, Actions).
- **Canvas**: React Flow area.
- **Toolbar**: Save, Compile, Run Backtest.

### 2.2 Custom Nodes
**File**: `src/components/studio/nodes/IndicatorNode.tsx` (NEW)
**File**: `src/components/studio/nodes/LogicNode.tsx` (NEW)
**File**: `src/components/studio/nodes/ActionNode.tsx` (NEW)

**Block Types**:
- **Indicators**: RSI, MACD, MA (Moving Average), Price.
- **Logic**: AND, OR, IF (> < =).
- **Actions**: BUY, SELL, CLOSE.

---

## TASK 3: STRATEGY COMPILER

### 3.1 Compiler Logic
**File**: `src/lib/algo/compiler.ts` (NEW)

**Logic**:
- Traverse the React Flow graph (Nodes & Edges).
- Convert connections into a linear execution flow or rule set.
- Output: JSON structure compatible with our Backtest Engine (Phase 22).

### 3.2 Integration
- Connect "Run Backtest" button in Studio to `/api/ai/backtest`.

---

## DELIVERABLES

1. ✅ **Drag & Drop Editor**: Build strategies like Lego.
2. ✅ **Custom Nodes**: Rich library of trading blocks.
3. ✅ **Compiler**: Turn diagrams into money.

---

## EXECUTION COMMAND

```bash
Execute PHASE 29 (Algo Studio)

Implement:
1. Install @xyflow/react
2. Visual Canvas & Nodes
3. Strategy Compiler

Quality:
- UX: Smooth drag & drop
- Performance: Handle complex graphs
- Build: 0 errors
```
