---
title: "Uptime-Kuma Architecture Patterns for Apex-OS"
description: "Adapt heartbeat monitoring, status pages, notification providers, and health dashboards from uptime-kuma to RaaS AGI trading platform"
status: pending
priority: P1
effort: 16h
branch: main
tags: [monitoring, health, notifications, status-page, uptime-kuma]
created: 2026-03-01
---

# Uptime-Kuma Architecture Patterns for Apex-OS

## Objective

Apply 5 architectural patterns from louislam/uptime-kuma to Apex-OS trading platform. NOT copying code -- adapting patterns to TypeScript/Next.js/Supabase stack.

## Core Patterns Being Adapted

| Uptime-Kuma Pattern | Apex-OS Application |
|---------------------|---------------------|
| Self-scheduling heartbeat loop | Agent health monitoring (push model) |
| 90-dot status bar + status page | System status page with service timeline |
| Provider+Factory notification system | Multi-channel alert routing (Telegram/Discord/webhook) |
| JSON Query monitors + maintenance windows | Exchange API health + market closure suppression |
| Badge generation + response time graphs | Performance badges + latency sparklines |

## Existing Infrastructure (Leverage, Don't Rebuild)

- `agent_heartbeats` table exists (basic schema, needs enhancement)
- `AgentEventBus` + Redis pub/sub already operational
- `TradingWebSocketServer` handles real-time push
- `NotificationService` exists (DB-only, no external channels)
- `/api/health/diagnosis` has basic health checks
- `/api/v1/admin/agents/status` has rudimentary agent status

## Phases

| # | Phase | Effort | Status |
|---|-------|--------|--------|
| 1 | [Agent Heartbeat & Health System](phase-01-agent-heartbeat-health.md) | 4h | pending |
| 2 | [System Status Page](phase-02-system-status-page.md) | 4h | pending |
| 3 | [Notification Provider Architecture](phase-03-notification-provider-architecture.md) | 3h | pending |
| 4 | [Trading Health Monitors](phase-04-trading-health-monitors.md) | 3h | pending |
| 5 | [Dashboard Integration](phase-05-dashboard-integration.md) | 2h | pending |

## Dependencies

- Phase 2 depends on Phase 1 (status page reads heartbeat data)
- Phase 3 can run parallel with Phase 2
- Phase 4 depends on Phases 1+3 (monitors use heartbeat + notifications)
- Phase 5 depends on all previous phases

## Key Decisions

1. **Push model** (agents POST heartbeat) vs pull (server polls agents) -- chose PUSH per uptime-kuma pattern
2. **Supabase table** for heartbeat storage (not Redis) -- need historical data for uptime %
3. **One-file-per-provider** notification pattern -- flat, zero-framework, easy to add channels
4. **90-dot bar** adapted to 90 x 1-minute intervals for trading session timeline
5. **`important` flag** on heartbeats -- only trigger notifications on state transitions

## Unresolved Questions

1. Heartbeat retention policy -- how long to keep historical data? (suggest 90 days, pruned via cron)
2. Public vs authenticated status page -- trading platform likely needs auth; decide per-org visibility
3. Exchange maintenance schedule source -- manual config or auto-detect from exchange API?
