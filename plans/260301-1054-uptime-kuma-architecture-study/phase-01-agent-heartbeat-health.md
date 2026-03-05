# Phase 1: Agent Heartbeat & Health System

## Context Links

- [Uptime-Kuma Heartbeat Architecture](research/researcher-01-architecture-patterns.md#2-background-job-architecture)
- Existing: `src/database/migrations/create_agent_heartbeats_table.sql`
- Existing: `src/app/api/v1/admin/agents/status/route.ts`
- Existing: `backend/services/agent-execution.ts`

## Overview

- **Priority:** P1 (foundation for all other phases)
- **Status:** pending
- **Effort:** 4h

Adapt uptime-kuma's self-scheduling heartbeat loop to Apex-OS background agents. Each agent (guardian, auditor, signal-generator, price-feed, etc.) POSTs a heartbeat after every execution cycle. Server detects DOWN when heartbeat expires past configurable threshold.

## Key Insights from Uptime-Kuma

- **Self-scheduling timer:** Each monitor owns its own `setTimeout` loop -- no centralized scheduler
- **Push model:** External services POST heartbeat; server marks DOWN when receive window expires
- **`important` flag:** Only state-transition heartbeats trigger notifications (UP->DOWN, DOWN->UP)
- **Status enum:** 0=DOWN, 1=UP, 2=PENDING, 3=MAINTENANCE -- we adapt to: `up | down | degraded | maintenance`
- **Retry interval:** Separate shorter interval when service is in degraded state

## Requirements

### Functional
- Each background service posts heartbeat with: agent_id, status, latency_ms, metadata (JSON)
- Heartbeat expiry detection: if no heartbeat received within `2 * expected_interval`, mark DOWN
- State transition detection: compare current status vs previous; set `important=true` on transitions
- API endpoint `GET /api/v1/health/agents` returns all agent statuses with uptime %
- API endpoint `POST /api/v1/health/heartbeat` for agents to push heartbeats
- Uptime % calculation: count(UP heartbeats) / count(all heartbeats) for 24h/7d/30d windows

### Non-Functional
- Heartbeat writes must be fast (<50ms) -- no blocking agent execution
- Stale heartbeat cleanup: cron job prunes records older than 90 days
- No single point of failure -- agents continue trading even if heartbeat system is down

## Architecture

```
Agent (guardian/auditor/signal-gen/price-feed)
  │
  └─ After each cycle: POST /api/v1/health/heartbeat
       { agent_id, status, latency_ms, metadata }
            │
            ▼
     ┌──────────────┐
     │ Heartbeat API │──► Supabase: agent_heartbeats (INSERT)
     │   (Next.js)   │──► Redis: PUBLISH 'agent:heartbeat' (for WS push)
     └──────────────┘
            │
            ▼
     ┌──────────────────┐
     │ Expiry Checker    │  Cron every 60s: SELECT agents WHERE
     │ (cron endpoint)   │  last_heartbeat < NOW() - 2*interval
     │                   │  → Mark DOWN, set important=true
     └──────────────────┘
            │
            ▼
     ┌──────────────────┐
     │ Notification      │  On important=true transitions
     │ Dispatcher        │  → Phase 3 provider system
     └──────────────────┘
```

## Related Code Files

### Modify
- `src/database/migrations/create_agent_heartbeats_table.sql` -- enhance schema
- `src/app/api/v1/admin/agents/status/route.ts` -- rewrite to use heartbeat data
- `src/lib/system/health-mesh.ts` -- integrate heartbeat checks

### Create
- `src/lib/health/heartbeat-service.ts` -- core heartbeat logic (insert, expiry check, uptime calc)
- `src/lib/health/types.ts` -- HeartbeatRecord, AgentStatus, HeartbeatConfig interfaces
- `src/app/api/v1/health/heartbeat/route.ts` -- POST endpoint for agents
- `src/app/api/v1/health/agents/route.ts` -- GET endpoint for dashboard
- `src/app/api/cron/heartbeat-check/route.ts` -- cron: detect expired heartbeats
- `backend/lib/heartbeat-reporter.ts` -- utility class agents import to POST heartbeats

## Implementation Steps

1. **Enhance heartbeat schema** -- add `latency_ms`, `important`, `status` enum, `interval_seconds`, index on `(agent_id, created_at DESC)`
2. **Create `types.ts`** -- define HeartbeatRecord, AgentConfig, AgentStatus interfaces
3. **Create `heartbeat-service.ts`** -- singleton with methods: `recordBeat()`, `checkExpired()`, `getUptime()`, `getAgentStatuses()`
4. **Create POST heartbeat endpoint** -- validates agent_id against known agents list, inserts record, publishes to Redis
5. **Create GET agents endpoint** -- returns all agents with current status, uptime %, last heartbeat, latency
6. **Create cron heartbeat-check** -- runs every 60s, queries for expired agents, marks DOWN, sets important=true
7. **Create `heartbeat-reporter.ts`** -- backend utility: `new HeartbeatReporter('guardian').beat({ latency, metadata })`
8. **Wire reporters into existing agents** -- add `reporter.beat()` call at end of each agent's execution cycle in `price-feed.ts`, `order-manager.ts`, `automation-engine.ts`, `copy-trading.ts`
9. **Write migration SQL** -- ALTER TABLE agent_heartbeats or CREATE new enhanced table

## Todo List

- [ ] Write enhanced migration SQL
- [ ] Create types.ts with interfaces
- [ ] Implement heartbeat-service.ts
- [ ] Create POST /api/v1/health/heartbeat endpoint
- [ ] Create GET /api/v1/health/agents endpoint
- [ ] Create cron heartbeat-check endpoint
- [ ] Create heartbeat-reporter.ts utility
- [ ] Wire reporter into price-feed.ts
- [ ] Wire reporter into order-manager.ts
- [ ] Wire reporter into automation-engine.ts
- [ ] Wire reporter into copy-trading.ts
- [ ] Wire reporter into agent-execution.ts
- [ ] Test heartbeat recording and expiry detection

## Success Criteria

- All 8 background services POST heartbeat after each cycle
- Expired agents detected within 2 minutes of missed heartbeat
- `GET /api/v1/health/agents` returns accurate status + uptime % for all agents
- State transitions correctly flagged with `important=true`
- Heartbeat writes complete in <50ms (non-blocking)

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Heartbeat DB writes slow down agents | High | Use async fire-and-forget with error swallow |
| Supabase rate limits on frequent INSERTs | Medium | Batch inserts or use Redis buffer → periodic flush |
| False DOWN during deploy/restart | Medium | Grace period: require 3 consecutive misses before DOWN |

## Security Considerations

- Heartbeat POST endpoint requires internal API key (not user-facing)
- Agent IDs validated against allowlist -- reject unknown agent_ids
- No sensitive data in heartbeat metadata (no API keys, no user PII)

## Next Steps

- Phase 2 reads heartbeat data for status page visualization
- Phase 3 notification system triggers on `important=true` transitions
