# Uptime Kuma — Architecture & Patterns Research

**Date:** 2026-03-01
**Sources:** [DeepWiki Architecture](https://deepwiki.com/louislam/uptime-kuma/2-architecture) · [DeepWiki Heartbeats](https://deepwiki.com/louislam/uptime-kuma/3.2-heartbeats) · [DeepWiki Notifications](https://deepwiki.com/louislam/uptime-kuma/4-notification-system) · [GitHub](https://github.com/louislam/uptime-kuma)

---

## 1. Real-Time Monitoring Architecture

**Stack:** Vue.js 3 SPA + Node.js/Express backend + Socket.IO (WebSocket)

**Pattern: Observer via Socket.IO rooms**
- Server broadcasts to user-specific rooms: `io.to(userID).emit('heartbeat', data)`
- Client Vue app uses a shared `$root` mixin to sync state from socket events
- Events: `monitorList`, `heartbeat`, `login`, `loginByToken`, `add`, `editMonitor`
- HTTP = stateless ops; WebSocket = bidirectional live events (no polling)
- Reverse proxy requires `Upgrade` + `Connection` headers for WebSocket passthrough

**Key decision:** Dual-channel design — HTTP for CRUD, Socket.IO for push updates.

---

## 2. Background Job Architecture (Heartbeat/Scheduling)

**Pattern: Self-scheduling timer loop (not cron)**

```
Monitor.start(io) → beat() → setTimeout(beat, interval * 1000) → loop
```

- Each `Monitor` instance runs its own independent `setTimeout` loop
- `beat()` is async, non-blocking — suits Node.js single-thread model
- Intervals: normal (`monitor.interval`, default 60s), retry (`monitor.retryInterval`), maintenance (skip)
- Min interval: 20s (demo) / `MIN_INTERVAL_SECOND` (prod)
- Timeout per check: `interval * 1000 * 0.8` when not set explicitly

**Maintenance windows:** Croner jobs toggle monitor state → `MAINTENANCE` (status=3), suppressing notifications.

**Push monitors (passive):** No active check — wait for external HTTP POST to `/api/push/:pushToken`. Saves DOWN heartbeat only when receive window expires.

**Key decision:** No centralized scheduler — each monitor owns its own loop. Simple, but no cross-monitor coordination.

---

## 3. Notification/Plugin System

**Pattern: Provider + Factory Registry**

- Base class: `NotificationProvider` (`server/notification-providers/notification-provider.js`)
- Required interface: `send(notification, msg, monitorJSON, heartbeatJSON)`
- Optional: `renderTemplate()` via Liquid templating engine
- Template context: `msg`, `monitorJSON`, `heartbeatJSON`, `status`, `hostnameOrURL`

**Registration flow:**
1. `Notification.init()` called at server startup (`server.js:117`)
2. Each provider validated (unique name + `send()` method)
3. Providers indexed by name in registry
4. Runtime: dispatch by name lookup

**Scale:** 80–90+ providers across 7 categories:
- Email (SMTP, SendGrid, Resend)
- Chat (Discord, Slack, Teams, Telegram)
- SMS (Twilio, ClickSendSMS)
- Push (Pushover, Gotify)
- Incident Mgmt (PagerDuty, Opsgenie)
- Home Automation (Home Assistant)
- Aggregators (Apprise, Webhook, GoogleSheets)

**Key decision:** Flat file-per-provider structure (`server/notification-providers/*.js`). Adding a new provider = one file + register. Zero framework overhead.

---

## 4. Data Persistence & Status Pages

**ORM:** RedBean-Node (Active Record pattern)
- `R.dispense('heartbeat')` → create bean
- `R.store(bean)` → persist
- `R.isoDateTimeMillis(dayjs.utc())` → UTC timestamps

**Database:**
- Default: SQLite at `data/kuma.db` (WAL mode for atomic commits)
- Optional: MariaDB for higher concurrency
- ORM abstracts the difference — same code for both

**Heartbeat schema fields:**
| Field | Type | Purpose |
|---|---|---|
| `monitor_id` | FK | Links to monitor config |
| `time` | ISO DateTime UTC | When check ran |
| `status` | 0/1/2/3 | DOWN/UP/PENDING/MAINTENANCE |
| `ping` | ms | Response time |
| `msg` | string | Error/status message |
| `downCount` | int | Consecutive failure counter |
| `important` | bool | State transition flag |

**Uptime calculation:** Computed inline per heartbeat save — no separate aggregation pass.

**Notification trigger:** Only on `important=true` beats (status transitions), subject to `resendInterval` retry policy.

**Constraint:** NFS volumes unsupported — SQLite WAL requires reliable file locking.

---

## 5. Self-Hosting Architecture

**Primary: Docker**
- Multi-stage build (separate build deps from runtime)
- Variants: standard (MariaDB + Chromium), slim (SQLite only), rootless (unprivileged)
- Image: `louislam/uptime-kuma`

**Non-Docker:** Node.js ≥ 20.4 + PM2 for process supervision

**Config:** Environment variables — `UPTIME_KUMA_PORT`, `DATA_DIR`, DB selection

**Migration handling:** Temporary migration server spun up during schema updates → Docker healthchecks stay green → orchestration won't restart prematurely

**Singleton server:** `UptimeKumaServer` singleton centralizes monitor control + maintenance scheduling

**Key decision:** SQLite default → zero external DB dependency → truly single-process self-hosting. MariaDB opt-in for teams.

---

## Architectural Summary

| Concern | Pattern | Complexity |
|---|---|---|
| Real-time | Socket.IO rooms (observer) | Low |
| Scheduling | Per-monitor setTimeout loop | Very Low |
| Notifications | Provider + static factory registry | Low |
| Persistence | RedBean ORM + SQLite WAL | Very Low |
| Deployment | Docker multi-stage + env config | Low |

**Core philosophy:** Maximum simplicity for self-hosting. Single Node.js process, single SQLite file, no external dependencies required. Extensibility via flat file convention (add a provider file, done).

---

## Unresolved Questions

1. **Concurrent monitor scale ceiling** — No published benchmark on max monitors before `setTimeout` loop degrades. Critical for high-density deployments.
2. **Multi-node / HA** — Architecture is inherently single-process. No documented horizontal scaling path; MariaDB helps DB concurrency but not compute.
3. **Status page caching** — No detail found on how public status pages cache/serve data at traffic spikes.
4. **Plugin security model** — Notification providers run in same process; no sandboxing. Risk if third-party providers added.
