# Phase 5: Dashboard Integration

## Context Links

- [Uptime-Kuma Dashboard UX](research/researcher-02-features-ux.md#4-dashboard-ux-patterns)
- Depends on: All previous phases
- Existing: `src/app/[locale]/admin/` -- admin pages
- Existing: `src/components/admin/` -- admin components

## Overview

- **Priority:** P2
- **Status:** pending
- **Effort:** 2h

Integrate health monitoring components from Phases 1-4 into the existing Apex-OS admin dashboard. Adapts uptime-kuma's dashboard UX patterns: inline sparkline charts, color-coded status indicators, monitor list with real-time updates. This is the presentation layer -- all data comes from APIs built in previous phases.

## Key Insights from Uptime-Kuma

- **Monitor list:** Icon (colored circle) + name + status badge + response time + uptime % + last check
- **Inline sparklines:** Small response time chart per monitor in list view
- **Detail view:** Full response time graph (avg/min/max), 90-day heartbeat bar, log table
- **Real-time updates:** WebSocket pushes update individual rows without full page refresh
- **Color coding:** Green=UP, Red=DOWN, Yellow=maintenance/pending, Gray=no data
- **Dark/light mode** + mobile responsive

## Requirements

### Functional
- System health dashboard section in admin panel (`/admin/health`)
- Agent list with: status badge, name, uptime %, avg latency, sparkline, last heartbeat time
- Click agent row → detail view with: full heartbeat dot bar, response time chart, recent log table
- Exchange health section: exchange name + status + latency
- Maintenance window indicator: active windows shown with countdown
- Real-time updates via WebSocket (reuse `use-health-stream.ts` from Phase 2)
- Color-coded throughout: green/red/yellow/gray

### Non-Functional
- Dashboard loads in <500ms (data already cached from cron checks)
- Sparkline renders as lightweight SVG (no chart library dependency)
- Mobile: sparklines hidden, status badges and uptime % remain visible

## Architecture

```
/admin/health
├── System Health Overview Card (overall status + counts)
├── Agent Health Table
│   ├── Row: [●] Guardian Agent    99.5%  42ms  ▂▃▅▂▃  2s ago
│   ├── Row: [●] Auditor Agent     99.8%  38ms  ▂▃▂▂▃  5s ago
│   └── Row: [●] Signal Generator  98.2%  67ms  ▃▅▇▃▅  12s ago
├── Exchange Health Cards
│   ├── Binance: ● Operational  23ms
│   └── Bybit:   ● Operational  45ms
├── Active Maintenance Windows
│   └── "Weekly Binance maintenance" — ends in 1h 23m
└── Agent Detail Modal (on row click)
    ├── 90-dot heartbeat bar (from Phase 2 component)
    ├── Response time chart (last 1h, avg/min/max lines)
    └── Recent heartbeat log table (last 50 entries)

Data source: GET /api/v1/health/agents + /api/v1/health/status
Live updates: use-health-stream.ts WebSocket hook
```

## Related Code Files

### Create
- `src/app/[locale]/admin/health/page.tsx` -- admin health dashboard page
- `src/components/admin/health/system-health-overview-card.tsx` -- summary card (total agents, up/down counts, overall status)
- `src/components/admin/health/agent-health-table.tsx` -- sortable table of all agents
- `src/components/admin/health/agent-health-row.tsx` -- single agent row with sparkline
- `src/components/admin/health/agent-detail-modal.tsx` -- detail modal with full dot bar + chart + logs
- `src/components/admin/health/exchange-health-card.tsx` -- exchange status card
- `src/components/admin/health/maintenance-window-indicator.tsx` -- active maintenance countdown
- `src/components/admin/health/response-time-sparkline.tsx` -- inline SVG sparkline (last 30 data points)
- `src/components/admin/health/response-time-chart.tsx` -- full response time chart for detail modal

### Modify
- Admin navigation -- add "System Health" link to sidebar
- `src/app/[locale]/admin/layout.tsx` -- add health nav item if applicable

## Implementation Steps

1. **Create response-time-sparkline.tsx** -- pure SVG component: accepts `dataPoints: number[]` → renders polyline in 100x20 viewBox; green stroke if all UP, red if any DOWN
2. **Create system-health-overview-card.tsx** -- fetches from `/api/v1/health/agents` → displays: total agents, UP count, DOWN count, overall status badge, last updated
3. **Create agent-health-row.tsx** -- single row: status dot (colored circle) + agent name + uptime % + avg latency + sparkline + relative time ("2s ago")
4. **Create agent-health-table.tsx** -- renders all agent rows; sortable by status/uptime/latency; uses `use-health-stream.ts` for real-time row updates
5. **Create agent-detail-modal.tsx** -- on row click: shows heartbeat-dot-bar (Phase 2), response-time-chart (SVG path with avg/min/max), and recent heartbeat log table (last 50)
6. **Create response-time-chart.tsx** -- larger SVG chart: X axis = time, Y axis = latency; avg line (blue), min/max area (gray fill); last 60 data points
7. **Create exchange-health-card.tsx** -- small card per exchange: name + status dot + latency + last check time
8. **Create maintenance-window-indicator.tsx** -- shows active maintenance windows with title + countdown timer
9. **Assemble page.tsx** -- compose all components; SSR fetch initial data, client hydration for WS updates
10. **Add nav link** -- add "System Health" to admin sidebar navigation

## Todo List

- [ ] Create response-time-sparkline.tsx
- [ ] Create system-health-overview-card.tsx
- [ ] Create agent-health-row.tsx
- [ ] Create agent-health-table.tsx
- [ ] Create agent-detail-modal.tsx
- [ ] Create response-time-chart.tsx
- [ ] Create exchange-health-card.tsx
- [ ] Create maintenance-window-indicator.tsx
- [ ] Assemble /admin/health page
- [ ] Add health nav item to admin sidebar
- [ ] Wire WebSocket real-time updates
- [ ] Mobile responsive testing
- [ ] Dark mode styling verification

## Success Criteria

- Admin health dashboard shows all agents with accurate status + metrics
- Sparklines render correctly for each agent row
- Click row → detail modal with dot bar + chart + logs
- Exchange health cards show real-time exchange API status
- Maintenance windows displayed with countdown
- Real-time updates: agent status changes reflected in <5s
- Mobile: table readable, sparklines hidden, status badges visible

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Too many re-renders from WebSocket updates | Medium | Use React.memo on rows; only re-render changed agents |
| Large heartbeat log table slow to render | Low | Virtualize with windowing if >100 rows; default limit 50 |
| SVG sparkline performance with many agents | Low | SVG is lightweight; 30 data points per sparkline is trivial |

## Security Considerations

- Admin-only page: requires admin JWT authentication
- Health data is operational metadata -- no user PII exposed
- Detail modal shows latency and status only -- no raw error stack traces

## Next Steps

- Future: embeddable health widget for client dashboards (iframe or web component)
- Future: historical uptime reports with date range picker (monthly SLA reports)
- Future: custom alert thresholds per agent configurable from dashboard
