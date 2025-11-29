# CLI PHASE 14: ENTERPRISE API (THE WHALE REVENUE)

## Strategic Context: 遠交近攻 (Befriend the Distant, Attack the Near)

**Sun Tzu Principle**: "When the enemy is strong, avoid him. When he is weak, attack him. But always seek alliances that strengthen your position."

**Application**: Instead of fighting exchanges, we become their *supplier*. We sell our "Brain" (AI Signals) to them via API. This creates a high-value revenue stream ($5k-$10k/mo per client) with zero acquisition cost per user.

**Objective**: Launch B2B API Business Unit.
**Timeline**: Week 5 (2-3 days CLI execution)

---

## TASK 1: API KEY MANAGEMENT (THE KEYS TO THE KINGDOM)

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_enterprise_api.sql` (NEW)

```sql
CREATE TABLE enterprise_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES users(id), -- The B2B Client
  key_hash TEXT NOT NULL, -- Store SHA-256 hash, never plain text
  key_prefix TEXT NOT NULL, -- "apx_live_..."
  name TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{read_signals}', 
  rate_limit INTEGER DEFAULT 1000, -- Requests per minute
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enterprise_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES enterprise_api_keys(id),
  endpoint TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  latency_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_enterprise_usage_key ON enterprise_usage(api_key_id);
```

### 1.2 Key Generation API
**File**: `src/app/api/enterprise/keys/create/route.ts` (NEW)

**Logic**:
- Generate `apx_live_<random_32_chars>`
- Return full key ONCE.
- Store Hash in DB.

---

## TASK 2: USAGE METERING (PAY-AS-YOU-GO)

### 2.1 API Middleware
**File**: `src/middleware/enterprise-auth.ts` (NEW)

**Logic**:
- Extract `Authorization: Bearer apx_live_...`
- Hash key & validate against DB.
- Check Rate Limit (Redis or DB count).
- Log usage to `enterprise_usage` (Async/Queue to avoid latency).

### 2.2 Metering Dashboard
**File**: `src/app/[locale]/enterprise/dashboard/page.tsx` (NEW)

**Features**:
- Chart: API Requests over time.
- Table: Recent Errors.
- Billing: Current Month Usage cost.

---

## TASK 3: DEVELOPER DOCUMENTATION

### 3.1 Docs Page
**File**: `src/app/[locale]/docs/api/page.tsx` (NEW)

**Content**:
- Authentication (`Bearer Token`).
- Endpoints:
  - `GET /v1/signals/latest`
  - `GET /v1/market/sentiment`
- Error Codes.
- Rate Limits.

---

## DELIVERABLES

1. ✅ **Secure Key System**: Hashed keys, revocable instantly.
2. ✅ **Usage Tracking**: Every call billed.
3. ✅ **Dev Portal**: Self-serve integration for B2B clients.

---

## EXECUTION COMMAND

```bash
Execute PHASE 14 (Enterprise API)

Implement:
1. API Key Management (DB + Create API)
2. Usage Metering Middleware
3. Developer Documentation Portal

Quality:
- Security First (Hashing, Scopes)
- High Performance (Async logging)
- Build: 0 errors
```
