# Apex OS — System Architecture

**Version:** 2.0 | **Stack:** Next.js 16 + React 19 + TypeScript + Supabase + Redis + WebSocket

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                      │
│  Browser (Next.js SSR/CSR)  ·  Mobile  ·  Telegram Bot             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS / WSS
┌───────────────────────────────▼─────────────────────────────────────┐
│                    FRONTEND LAYER (Vercel)                           │
│  Next.js 16 App Router  ·  React 19  ·  Tailwind v4  ·  Zustand    │
│  i18n (next-intl)  ·  Framer Motion  ·  Multi-tenancy routing       │
└──────┬──────────────────────────────────────┬───────────────────────┘
       │ REST API + Server Actions            │ WebSocket (wss://)
┌──────▼──────────────┐         ┌─────────────▼───────────────────────┐
│  BACKEND SERVICES   │         │      WEBSOCKET SERVER               │
│  (VPS / Railway)   │         │  Real-time price feed               │
│  Order Manager     │         │  Order book updates                 │
│  Risk Engine       │         │  Position notifications             │
│  Copy Trading      │         │  Redis pub/sub relay                │
│  Automation Engine │         └─────────────────────────────────────┘
│  ML Signal Gen     │
│  Price Feed        │
└──────┬──────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                       │
│  Supabase (PostgreSQL + RLS)  ·  Redis (cache + pub/sub)           │
│  Agent Memory (sensory / short-term / long-term)                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| State | Zustand, React Context |
| Animations | Framer Motion |
| Auth | Supabase Auth + JWT + MFA (TOTP) |
| Database | Supabase (PostgreSQL), RLS on all tables |
| Cache / PubSub | Redis (Upstash or Redis Cloud) |
| WebSocket | Node.js WS server (backend/websocket/) |
| ML/AI | XGBoost (Python), TypeScript signal generator |
| Payments | Polar.sh + NOWPayments (packages/vibe-payment/) |
| Monitoring | Sentry, Uptime monitoring |
| Deployment | Vercel (frontend) + VPS/PM2 (backend) |

---

## Module Architecture

### Frontend (`src/`)

```
src/
├── app/[locale]/           — 20+ pages (trade, dashboard, admin, finance, signals)
├── lib/                    — 30+ modules
│   ├── auth.ts             — Supabase auth helpers
│   ├── rate-limit.ts       — Redis-backed rate limiting
│   ├── payments/           — Polar + NOWPayments integration
│   ├── trading/            — Order placement, position management
│   ├── agents/             — Frontend agent interfaces
│   └── ml/                 — Signal consumption
├── middleware/
│   ├── csrf.ts             — CSRF token inject/validate
│   ├── enterprise-auth.ts  — Admin/enterprise route guard
│   └── rateLimit.ts        — Per-IP rate limiting
├── middleware.ts           — Global: i18n + rate limit + CSRF + auth
├── components/             — UI components (Aura Elite design)
├── hooks/                  — React hooks
└── types/                  — TypeScript type definitions
```

### Backend (`backend/`)

```
backend/
├── services/
│   ├── order-manager.ts    — Order lifecycle, execution
│   ├── risk-engine.ts      — Position sizing, drawdown limits
│   ├── copy-trading.ts     — Leader/follower copy logic
│   ├── automation-engine.ts — SL/TP automation rules
│   ├── trading.ts          — Binance API wrapper
│   ├── price-feed.ts       — Real-time price ingestion
│   └── ai-service.ts       — ML signal pipeline orchestration
├── websocket/server.ts     — WS server (Redis pub/sub relay)
├── ml/signal-generator.ts  — XGBoost inference → trading signals
├── agents/
│   ├── guardian.ts         — Volume spike + anomaly detection
│   └── auditor.ts          — Financial reconciliation agent
├── memory/
│   ├── sensory.ts          — Immediate market event buffer
│   ├── short-term.ts       — Session-level context
│   └── long-term.ts        — Persistent agent knowledge
├── workers/                — Background job processors
└── events/                 — Trading event bus (EventEmitter)
```

### Payments (`packages/vibe-payment/`)

Standalone module — Polar.sh (fiat subscriptions) + NOWPayments (crypto).
Webhook signature verification with replay-attack protection.

---

## Data Flow

### Request Lifecycle (HTTP)

```
Browser → Vercel Edge → middleware.ts
  [1] Multi-tenancy routing (custom domain → /_sites/[slug])
  [2] Rate limit check (Redis, IP-based, 10 req/min default)
  [3] CSRF validation (mutation requests)
  [4] i18n locale detection (next-intl)
  [5] Enterprise auth guard (admin routes)
  → Next.js Route Handler / Server Action
  → Supabase query (RLS enforced automatically)
  → Response
```

### Trading Pipeline

```
Price Feed → Redis pub/sub
  → WebSocket server broadcasts to connected clients
  → Automation Engine polls open positions
  → SL/TP triggers → Order Manager → Binance execution
  → Position update → Supabase write → Redis invalidate
  → WebSocket push → UI update
```

### ML Signal Flow

```
Binance REST API → Python DataAgent (1m candles)
  → Supabase market_data_ohlcv (TimescaleDB-like schema)
  → ML Engine (every 5min): RSI + MACD + Bollinger Bands → XGBoost
  → confidence > 70% → ai_signals table insert
  → Supabase Realtime → Dashboard update
  → Nightly re-training on expanded dataset
```

### Agent Event Bus

```
TradingEventBus (EventEmitter)
  → Guardian Agent: volume spikes, unusual patterns → security_alerts
  → Auditor Agent: balance reconciliation → daily_reconciliation_logs
  → Agent Memory: sensory → short-term → long-term consolidation
```

---

## Event-Driven Architecture

Core pattern: `backend/events/` trading event bus decouples services.

| Event | Producer | Consumers |
|-------|---------|-----------|
| `order.filled` | Order Manager | Copy Trading, Auditor, Position Tracker |
| `price.tick` | Price Feed | Automation Engine, WebSocket, ML |
| `signal.generated` | ML Engine | Guardian, Dashboard |
| `alert.triggered` | Guardian | Admin Dashboard, Notification |
| `reconciliation.failed` | Auditor | Security Alerts, Admin |

---

## Deployment Architecture

```
GitHub Actions CI/CD
  ├── Lint + Build + Test + Security scan (npm audit)
  └── On pass:
      ├── Vercel auto-deploy (frontend)
      └── VPS deploy via SSH (backend services via PM2)

VPS (PM2 process manager):
  ├── websocket-server  (port 8080, Nginx reverse proxy → wss://)
  ├── order-manager
  ├── automation-engine
  ├── copy-trading
  └── guardian + auditor agents

Supabase:
  ├── PostgreSQL (primary DB + auth)
  ├── Realtime (WebSocket for DB changes)
  └── Point-in-time backup

Redis:
  ├── Rate limiting counters (TTL-based)
  ├── Session cache
  └── Pub/sub channel for price feed → WebSocket relay
```

---

## Scalability

| Concern | Strategy |
|---------|---------|
| Frontend traffic | Vercel auto-scales, CDN edge caching |
| WebSocket connections | Redis pub/sub allows horizontal WS server scale |
| Backend services | PM2 cluster mode (`instances: N`), CPU-based |
| Database | Supabase connection pooler; read replicas for ML queries |
| Rate limiting | Redis distributed counters (stateless API servers) |
| ML inference | Runs on dedicated VPS; async signal writes to DB |

---

## Redis Architecture

### Key Patterns

| Key Pattern | Type | TTL | Purpose |
|-------------|------|-----|---------|
| `rate_limit:{ip}` | String (counter) | 60s | Per-IP request counter |
| `price:{symbol}` | String (JSON) | 5s | Latest tick cache |
| `session:{userId}` | Hash | 3600s | Session metadata |
| `order_book:{pair}` | Sorted Set | 30s | Bids/asks by price |
| `leaderboard:copy` | Sorted Set | 300s | Leader rankings by ROI |
| `agent:memory:{agentId}` | Hash | 86400s | Agent sensory buffer |

### Sorted Set Usage

```
order_book:{pair}
  SCORE = price (float)
  MEMBER = "orderId:quantity:side"
  → ZRANGEBYSCORE for order matching
  → ZREVRANGEBYSCORE for best bid

leaderboard:copy
  SCORE = roi_percent (float)
  MEMBER = userId
  → ZREVRANGE 0 9 WITHSCORES for top 10
```

### Pub/Sub Channels

| Channel | Publisher | Subscribers |
|---------|-----------|-------------|
| `price-updates` | price-feed.ts | WS server, automation-engine, ML |
| `order-events` | order-manager.ts | copy-trading, auditor, position-tracker |
| `agent-events` | guardian.ts / auditor.ts | admin dashboard, notification service |

### TTL Policy

- `< 60s`: `rate_limit:*`, `price:*` — high-churn real-time data
- `5min–1hr`: `session:*`, `order_book:*` — user sessions, market state
- `24hr+`: `agent:memory:*` — agent knowledge persistence
- No TTL: `leaderboard:copy` — manually invalidated on rank change

---

## Agent Memory Architecture

### 3-Tier Memory Model

```
[Market Events / Real-time Data]
         |
         v
+--------------------+
|  SENSORY MEMORY    |  backend/memory/sensory.ts
|  (immediate)       |  Ring buffer, 100-event cap
|  TTL: 30s          |  Price ticks, order fills, alerts
+--------------------+
         |  consolidation worker (every 60s)
         v
+--------------------+
|  SHORT-TERM MEMORY |  backend/memory/short-term.ts
|  (session)         |  Current session context
|  TTL: 3600s        |  Active positions, pending orders
+--------------------+
         |  relevance scoring (nightly)
         v
+--------------------+
|  LONG-TERM MEMORY  |  backend/memory/long-term.ts
|  (persistent)      |  PostgreSQL (agent_memories table)
|  No TTL            |  Patterns, strategies, anomaly history
+--------------------+
```

### Consolidation Worker + Relevance Scoring

```
Every 60s:
  1. Drain sensory ring buffer
  2. Score each event: score = (recency*0.4) + (magnitude*0.4) + (frequency*0.2)
     recency   = 1 - (now - event.ts) / MAX_AGE
     magnitude = normalize(event.impact, 0, MAX_IMPACT)
     frequency = min(event.count / 10, 1.0)
  3. score > 0.7  → promote to short-term memory
  4. short-term age > 1hr AND score > 0.85 → persist to long-term (PostgreSQL)
  5. score < 0.3  → discard
```

---

## Database Index Strategy

### Critical PostgreSQL Indexes

```sql
-- Order lookup by user + time range (most common query)
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- Active position lookup (partial index — only open positions)
CREATE INDEX idx_positions_user_active ON positions(user_id, created_at DESC)
  WHERE status = 'open';

-- Closed position performance queries
CREATE INDEX idx_positions_user_status ON positions(user_id, status, closed_at DESC);

-- Admin audit log queries (by admin + time)
CREATE INDEX idx_audit_admin_created ON audit_logs(admin_id, created_at DESC);

-- Signal lookup by symbol + confidence (ML dashboard)
CREATE INDEX idx_signals_symbol_conf ON ai_signals(symbol, confidence DESC)
  WHERE confidence > 0.7;

-- Copy trading — follower lookup
CREATE INDEX idx_copy_follower ON copy_trading_relationships(follower_id, status);

-- Referral network traversal
CREATE INDEX idx_referral_referrer ON referral_network(referrer_id, created_at DESC);
```

### Index Selection Notes

- Composite indexes ordered by equality columns first, range/sort columns last
- Partial indexes on `status = 'open'` and `confidence > 0.7` cut index size by ~95%
- All indexes include `DESC` on timestamp columns for efficient pagination queries
