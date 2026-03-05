# Phase 2: System Status Page

## Context Links

- [Uptime-Kuma Status Page UX](research/researcher-02-features-ux.md#2-status-page-system)
- Depends on: [Phase 1 - Heartbeat System](phase-01-agent-heartbeat-health.md)
- Existing: `src/app/api/health/route.ts`, `src/app/api/health/diagnosis/route.ts`
- Existing: `backend/websocket/server.ts` (Redis pub/sub → WS push)

## Overview

- **Priority:** P1
- **Status:** pending
- **Effort:** 4h

Build a public-facing `/status` page showing real-time health of all Apex-OS services. Adapts uptime-kuma's 90-dot heartbeat bar, overall status banner, and uptime % display. Connected to existing WebSocket infrastructure for live push updates.

## Key Insights from Uptime-Kuma

- **90-dot heartbeat bar:** Each dot = 1 time period (configurable); green/red/gray = up/down/no-data
- **Overall status banner:** "All Systems Operational" / "Partial Outage" / "Major Outage" at top
- **Uptime % per service:** Calculated from heartbeat records -- 24h, 7d, 30d windows
- **Real-time push:** Socket.IO pushes new heartbeat data without polling
- **Incident management:** Manual incidents with severity levels overlaid on timeline

## Requirements

### Functional
- `/status` page accessible without authentication (public)
- Display all services with: name, current status badge, uptime % (24h/7d/30d), 90-dot bar
- Overall system status banner at top: operational / degraded / partial outage / major outage
- 90-dot bar: each dot = 1 minute (last 90 minutes); color-coded green/red/yellow/gray
- Real-time updates via WebSocket -- new heartbeats push dot updates without page refresh
- Response time display: average latency per service (from heartbeat latency_ms)
- Service grouping: Core (trading engine, order manager), Agents (guardian, auditor), Infrastructure (DB, Redis, WebSocket)

### Non-Functional
- Page loads in <1s (SSR with hydration)
- Dot bar renders as lightweight CSS/SVG (no heavy chart library)
- Mobile responsive -- dots shrink to 45 on mobile viewport

## Architecture

```
┌─────────────────────────────────────────────────┐
│  /status Page (Next.js SSR + Client Hydration)  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  Overall Status Banner                    │  │
│  │  "All Systems Operational" ● green        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ Core Services ───────────────────────────┐  │
│  │  Trading Engine   ● UP  99.9%  ●●●●●●●●● │  │
│  │  Order Manager    ● UP  99.8%  ●●●●●●●●● │  │
│  │  Price Feed       ● UP  100%   ●●●●●●●●● │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ AI Agents ───────────────────────────────┐  │
│  │  Guardian Agent   ● UP  99.5%  ●●●●●●●●● │  │
│  │  Auditor Agent    ● UP  99.7%  ●●●●●●●●● │  │
│  │  Signal Generator ● UP  98.2%  ●●●●●●●●● │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ Infrastructure ──────────────────────────┐  │
│  │  Database         ● UP  100%   ●●●●●●●●● │  │
│  │  WebSocket        ● UP  100%   ●●●●●●●●● │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │                          ▲
         │ SSR initial load         │ WebSocket push
         ▼                          │
   GET /api/v1/health/status   Redis 'agent:heartbeat'
   (aggregated snapshot)       → WS broadcast to /status subscribers
```

## Related Code Files

### Create
- `src/app/[locale]/status/page.tsx` -- status page (SSR + client)
- `src/components/health/status-page-layout.tsx` -- overall page layout
- `src/components/health/heartbeat-dot-bar.tsx` -- 90-dot bar component
- `src/components/health/service-status-row.tsx` -- single service row (name, badge, uptime, dots)
- `src/components/health/overall-status-banner.tsx` -- top banner component
- `src/components/health/uptime-percentage.tsx` -- uptime % display with timeframe tabs
- `src/hooks/use-health-stream.ts` -- WebSocket hook for real-time heartbeat updates
- `src/app/api/v1/health/status/route.ts` -- aggregated health snapshot API
- `src/lib/health/status-calculator.ts` -- compute overall status, group services, build dot arrays

### Modify
- `backend/websocket/server.ts` -- add `agent:heartbeat` Redis subscription → broadcast to status subscribers

## Implementation Steps

1. **Create status-calculator.ts** -- functions: `computeOverallStatus()`, `buildDotArray(agentId, minutes=90)`, `groupServicesByCategory()`
2. **Create GET /api/v1/health/status** -- calls heartbeat-service + status-calculator, returns full snapshot: `{ overall, groups: [{ name, services: [{ id, name, status, uptime, dots[], avgLatency }] }] }`
3. **Create heartbeat-dot-bar.tsx** -- renders 90 colored dots using CSS flex; tooltip on hover shows timestamp + status
4. **Create service-status-row.tsx** -- composites: status badge + name + uptime % + dot bar + avg latency
5. **Create overall-status-banner.tsx** -- derives status from services: all UP=operational, any DOWN=outage, any degraded=degraded
6. **Create uptime-percentage.tsx** -- tabs: 24h / 7d / 30d; fetches appropriate window
7. **Create status-page-layout.tsx** -- groups services by category, renders banner + groups
8. **Create page.tsx** -- SSR fetch initial snapshot, client-side hydration for WS updates
9. **Create use-health-stream.ts** -- connects to WS, subscribes to `system:health` channel, updates dot bar in real-time
10. **Modify WebSocket server** -- subscribe to Redis `agent:heartbeat` channel, broadcast to WS clients subscribed to `system:health`

## Todo List

- [ ] Implement status-calculator.ts
- [ ] Create GET /api/v1/health/status endpoint
- [ ] Build heartbeat-dot-bar.tsx component
- [ ] Build service-status-row.tsx component
- [ ] Build overall-status-banner.tsx component
- [ ] Build uptime-percentage.tsx component
- [ ] Assemble status-page-layout.tsx
- [ ] Create /status page with SSR + hydration
- [ ] Create use-health-stream.ts WebSocket hook
- [ ] Add agent:heartbeat broadcast to WebSocket server
- [ ] Mobile responsive testing (45 dots on mobile)
- [ ] Verify real-time dot updates via WebSocket

## Success Criteria

- `/status` page loads in <1s with SSR
- 90-dot bar accurately reflects last 90 minutes of service health
- Overall banner correctly derives from individual service statuses
- New heartbeats appear as real-time dot updates (no page refresh)
- Uptime % matches calculated values from heartbeat records
- Mobile: dots display correctly at reduced count

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 90-dot query slow on large heartbeat table | Medium | Index on (agent_id, created_at DESC), LIMIT 90 |
| WebSocket connection for unauthenticated /status page | Low | Separate public WS channel, read-only, no auth required for health data |
| SEO/crawlability of status page | Low | SSR ensures initial content visible to crawlers |

## Security Considerations

- Status page is public but shows only service names + status -- no internal IPs, no config details
- Health API returns aggregate data only -- no raw error messages exposed
- Rate limit on `/api/v1/health/status` to prevent abuse (10 req/min per IP)

## Next Steps

- Phase 5 embeds health components into admin dashboard
- Status page can later support custom domains per org (Phase 2 extension)
