# Phase 4: Trading Health Monitors

## Context Links

- [Uptime-Kuma Monitor Types](research/researcher-02-features-ux.md#1-monitor-types)
- [JSON Query Monitors](research/researcher-02-features-ux.md#5-api--automation)
- [Maintenance Windows](research/researcher-01-architecture-patterns.md#2-background-job-architecture)
- Depends on: [Phase 1](phase-01-agent-heartbeat-health.md), [Phase 3](phase-03-notification-provider-architecture.md)
- Existing: `backend/services/price-feed.ts`, `src/lib/binance/client.ts`

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** 3h

Adapt 3 uptime-kuma patterns to trading context: (1) JSON Query monitors for exchange API health, (2) maintenance windows for market closures, (3) SVG badge generation for strategy performance. These extend the heartbeat + notification system from Phases 1+3.

## Key Insights from Uptime-Kuma

- **JSON Query monitors:** HTTP GET → JSONPath expression → assert expected value. Maps to: `GET exchange/status → $.status === "ok"`
- **Maintenance windows:** Cron expression or date range → monitor status = MAINTENANCE → suppress notifications
- **Badge generation:** Shields.io-style SVG: `/api/badge/:id/status`, `/api/badge/:id/uptime`, `/api/badge/:id/ping` with customizable labels/colors/styles
- **Response time tracking:** avg/min/max lines on graph; maps to order fill speed + slippage tracking

## Requirements

### Functional

#### Exchange Health Monitors
- Monitor exchange API status endpoints via HTTP GET + JSON assertion
- Configurable check interval (default 60s)
- Assert response matches expected JSON query (e.g., `status === 1` for Binance)
- Record response time as latency metric
- Feed into heartbeat system (reuse Phase 1 infrastructure)

#### Maintenance Windows
- Define market closure windows: cron expression or date range
- During maintenance window: suppress all alerts for affected agents/exchanges
- Status page shows "Maintenance" badge (yellow) during window
- Auto-resume monitoring when window expires
- Support recurring windows (e.g., "every Sunday 00:00-02:00 UTC" for exchange maintenance)

#### Performance Badges
- SVG badge endpoint: `/api/v1/badge/:agentId/status` (UP/DOWN badge)
- SVG badge endpoint: `/api/v1/badge/:agentId/uptime` (uptime % badge)
- SVG badge endpoint: `/api/v1/badge/:agentId/latency` (avg latency badge)
- Query params: `label`, `color`, `style` (flat/plastic)
- Cacheable (5 min TTL) for embedding in docs/dashboards

#### Execution Latency Tracking
- Track order fill speed: time from order submit → exchange confirmation
- Track slippage: expected price vs actual fill price
- Store as heartbeat metadata for signal-generator and order-manager agents
- Surface in status page as response time metric

### Non-Functional
- Exchange health checks must not exceed 5s timeout
- Badge SVG generation must be <50ms (template-based, no runtime rendering)
- Maintenance window evaluation must be O(1) per heartbeat check

## Architecture

```
┌─────────────────────────────────────┐
│  Exchange Health Monitor (cron 60s) │
│  GET https://api.binance.com/...    │
│  Assert: $.status === 1             │
│  Record: latency_ms, UP/DOWN       │
│  → POST /api/v1/health/heartbeat   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Maintenance Window Evaluator       │
│  On heartbeat-check cron:           │
│  1. Load active windows from DB     │
│  2. Check if agent_id is covered    │
│  3. If yes → status = MAINTENANCE   │
│  4. Suppress notification dispatch  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Badge Generator                    │
│  GET /api/v1/badge/:id/status       │
│  → Query latest heartbeat           │
│  → Render SVG from template         │
│  → Cache-Control: max-age=300       │
└─────────────────────────────────────┘
```

### Data Model

```sql
-- maintenance_windows: scheduled alert suppression
CREATE TABLE maintenance_windows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    agent_ids TEXT[] NOT NULL,           -- which agents are affected
    start_at TIMESTAMPTZ,               -- one-time: fixed start
    end_at TIMESTAMPTZ,                 -- one-time: fixed end
    cron_expression VARCHAR(100),       -- recurring: cron syntax
    cron_duration_minutes INT,          -- recurring: how long each window lasts
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- exchange_monitors: exchange API health check config
CREATE TABLE exchange_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exchange_name VARCHAR(50) NOT NULL,  -- 'binance', 'bybit'
    endpoint_url VARCHAR(500) NOT NULL,
    json_query VARCHAR(200) NOT NULL,    -- JSONPath expression
    expected_value VARCHAR(200) NOT NULL,
    interval_seconds INT DEFAULT 60,
    timeout_ms INT DEFAULT 5000,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Related Code Files

### Create
- `src/lib/health/exchange-health-monitor.ts` -- HTTP GET + JSON query assertion logic
- `src/lib/health/maintenance-window-evaluator.ts` -- check if agent is in maintenance window
- `src/lib/health/badge-svg-generator.ts` -- SVG template rendering for badges
- `src/lib/health/execution-latency-tracker.ts` -- track order fill speed + slippage
- `src/app/api/cron/exchange-health-check/route.ts` -- cron endpoint for exchange monitoring
- `src/app/api/v1/badge/[agentId]/[type]/route.ts` -- SVG badge endpoint (status/uptime/latency)
- `src/app/api/v1/admin/maintenance/route.ts` -- CRUD maintenance windows
- `src/database/migrations/add-maintenance-windows-and-exchange-monitors.sql` -- migration

### Modify
- `src/app/api/cron/heartbeat-check/route.ts` (Phase 1) -- integrate maintenance window check before notification dispatch
- `src/lib/health/heartbeat-service.ts` (Phase 1) -- add `isInMaintenance()` method
- `backend/services/order-manager.ts` -- add fill speed tracking via heartbeat metadata
- `backend/services/trading.ts` -- add slippage tracking via heartbeat metadata

## Implementation Steps

1. **Create exchange-health-monitor.ts** -- `checkExchangeHealth(config)`: fetch URL → parse JSON → evaluate query → return UP/DOWN + latency
2. **Create cron exchange-health-check** -- loads active exchange_monitors from DB → runs checks → POSTs heartbeat for each exchange
3. **Create maintenance-window-evaluator.ts** -- `isInMaintenanceWindow(agentId, now)`: queries maintenance_windows table → evaluates cron or date range → returns boolean
4. **Integrate maintenance into heartbeat-check** -- before dispatching notifications, check `isInMaintenanceWindow()` → if true, set status=MAINTENANCE, skip notification
5. **Create badge-svg-generator.ts** -- SVG template strings for status/uptime/latency badges; uses string interpolation (no heavy library)
6. **Create badge API route** -- dynamic route `[agentId]/[type]` → query heartbeat data → render SVG → respond with `Content-Type: image/svg+xml` + cache headers
7. **Create execution-latency-tracker.ts** -- utility: `trackFillSpeed(orderId, submitTime, confirmTime)` and `trackSlippage(expected, actual)` → store in heartbeat metadata
8. **Wire latency tracking** -- add tracker calls in `order-manager.ts` after order fills and in `trading.ts` after execution
9. **Write migration** -- create maintenance_windows + exchange_monitors tables
10. **Create admin maintenance API** -- CRUD endpoints for maintenance windows

## Todo List

- [ ] Create exchange-health-monitor.ts
- [ ] Create cron exchange-health-check endpoint
- [ ] Create maintenance-window-evaluator.ts
- [ ] Integrate maintenance check into heartbeat-check cron
- [ ] Create badge-svg-generator.ts (3 badge types)
- [ ] Create badge API route
- [ ] Create execution-latency-tracker.ts
- [ ] Wire latency tracking into order-manager.ts
- [ ] Wire latency tracking into trading.ts
- [ ] Write migration SQL
- [ ] Create admin maintenance CRUD API
- [ ] Test exchange health check with Binance API
- [ ] Test maintenance window suppression
- [ ] Test badge SVG rendering

## Success Criteria

- Exchange health monitor detects Binance API down within 120s
- Maintenance windows correctly suppress notifications during configured periods
- Badge SVG renders correctly with accurate data; cacheable
- Fill speed and slippage tracked and visible in heartbeat metadata
- Maintenance status visible on status page (Phase 2) as yellow badge

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Exchange rate limits on health check endpoint | Medium | Use public status endpoint (no auth); 60s interval is conservative |
| JSON query evaluation on untrusted response | Medium | Sanitize input; use simple dot-path accessor, not full JSONPath eval |
| Cron expression parsing bugs | Low | Use proven library (cron-parser); validate on save |
| Badge cache serving stale data | Low | 5 min TTL is acceptable; real-time status is on /status page |

## Security Considerations

- Exchange monitor configs stored server-side only -- no API keys in endpoint URLs
- Badge endpoints are public (read-only, aggregate data only)
- Maintenance window CRUD requires admin auth
- JSON query evaluation sandboxed -- no `eval()`, only safe dot-path accessor

## Next Steps

- Phase 5 integrates latency data and exchange health into admin dashboard
- Future: auto-detect exchange maintenance from exchange API announcements
