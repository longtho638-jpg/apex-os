# Uptime Kuma — Features & UX Patterns Research
**Date:** 2026-03-01 | **Focus:** Status pages, monitors, alerts, dashboard UX, API/automation

---

## 1. Monitor Types (Multi-Monitor Management)

12 distinct monitor types, each with unique check logic:

| Type | Check Method | Use Case |
|------|-------------|----------|
| HTTP(s) | GET/POST, status codes | Web endpoints, APIs |
| HTTP(s) Keyword | Body contains string | Content verification |
| HTTP(s) Json Query | JSONPath expression match | API response validation |
| TCP Port | Raw TCP connect | DB ports, custom services |
| Ping | ICMP echo | Host reachability |
| DNS Record | DNS query + expected value | DNS propagation checks |
| Push | Cron/heartbeat push-in | Job completion, cron health |
| Docker Container | Docker socket inspect | Container status |
| WebSocket | WS connection + optional keyword | Real-time service health |
| Steam Game Server | GameDig protocol | Game server players/status |
| gRPC Keyword | gRPC call + keyword | Microservice health |
| Real Browser | Chromium headless visit | Full-page load checks |

**Grouping:** Monitors can be organized into **Groups** (logical containers) and tagged with **Tags** (multi-label, color-coded). Groups collapse/expand in dashboard. Tags enable filtering.

**Intervals:** Configurable 20s–3600s per monitor. Retry count configurable before alerting.

---

## 2. Status Page System

**Public-facing, zero-auth status pages** — core differentiator.

Architecture:
- Multiple status pages per instance (each with unique slug/URL)
- Custom domain mapping (CNAME → status page)
- Monitors selectively published per page (privacy control)
- **Incident management:** Manual incidents with title + message + severity (operational/degraded/partial outage/major outage)
- Automatic incident updates visible on page timeline

UX patterns:
- Each monitor shows: current status (up/down/pending/maintenance), uptime % (24h, 7d, 30d, 1yr), response time graph (90-day bar chart)
- Overall status banner at top ("All Systems Operational" / "Major Outage")
- Heartbeat bar: 90 colored dots = 90 time periods; green/red/gray = up/down/no data
- Subscribe to incidents via email (optional feature)

---

## 3. Notification/Alert Architecture

**90+ notification channels.** Selected integrations:

| Category | Examples |
|----------|---------|
| Chat | Telegram, Discord, Slack, Teams, Signal, Line, Rocket.Chat |
| Push | Pushover, Gotify, Ntfy, Apprise, PushDeer |
| Email | SMTP (generic), SendGrid, Mailgun |
| SMS/Voice | Twilio, Vonage, AliyunSMS |
| Webhook | Generic webhook (custom JSON payload), Zapier |
| Ops tools | PagerDuty, Opsgenie, Splunk On-Call, Freshdesk |
| Dev tools | GitHub Issues (auto-create), GitLab, Bitrix24 |
| Infra | Prometheus Alertmanager, Grafana webhook |
| Smart home | Home Assistant |

**Architecture pattern:** Each notification channel is a standalone class implementing a `send()` interface. Adding new channel = add one class. No shared state between channels. Notification groups allow sending one alert to multiple channels simultaneously.

**Alert logic:** Configurable resend interval, "notify on recovery" toggle, heartbeat type monitors with configurable push duration.

---

## 4. Dashboard UX Patterns

Real-time reactive UI (Vue 3 + Socket.io for live push):

- **Monitor list:** Icon (colored circle), name, URL/host, current status badge, response time (ms), uptime %, last check time
- **Uptime display:** Three timeframes side-by-side: 24h / 30d / 1yr — calculated from stored heartbeat records
- **Response time chart:** Inline sparkline per monitor; full chart on detail view
- **Detail view:** Full response time graph (average, min, max lines), 90-day heartbeat bar, cert expiry countdown, recent log table (time, status, ping, message)
- **Real-time updates:** Socket.io pushes heartbeat events without page refresh
- **Dark/light mode**
- **Mobile responsive**

Color coding: Green = up, Red = down, Yellow = pending/maintenance, Gray = no data

---

## 5. API & Automation

**REST API** (enabled via Settings → API Keys):
- Bearer token auth
- Endpoints: list monitors, get monitor, add monitor, edit monitor, pause/resume monitor, delete monitor
- Monitor status readable programmatically (for CI/CD gate checks)

**WebSocket API** (internal, same Socket.io connection):
- Real-time heartbeat subscription
- Used by dashboard and status pages

**Maintenance Windows:**
- Scheduled maintenance suppresses alerts during window
- Cron expression or date range
- Assign specific monitors to maintenance
- Status page shows "Under Maintenance" badge during window

**Badge Generation:**
- Shields.io-style SVG badges: `/api/badge/:id/status`, `/api/badge/:id/uptime`, `/api/badge/:id/ping`
- Query params: `label`, `labelColor`, `color`, `style` (flat/plastic/etc.)
- Embed in GitHub READMEs, internal docs

**Push Monitors (Heartbeat model):**
- Generate unique push URL per monitor
- External service POSTs to URL on success = "alive"
- No response within interval = "dead"
- Pattern: cron job POSTs after successful completion

---

## RaaS AGI Trading Platform — Inspiration Map

| Uptime Kuma Pattern | Apex-OS Application |
|--------------------|---------------------|
| Heartbeat push monitors | Strategy execution health — strategy POSTs heartbeat after each cycle |
| 90-dot status bar | Trade session timeline — per-minute P&L status visualization |
| Multi-status pages per domain | Per-client portfolio status pages with custom domains |
| Incident management + severity levels | Risk events (drawdown breach, margin call) with severity tiering |
| Maintenance windows + alert suppression | Market closure windows suppress false-positive latency alerts |
| Tag + group organization | Strategies grouped by market/asset class with multi-label tags |
| Response time graphs (avg/min/max) | Order execution latency tracking (fill speed, slippage) |
| 90+ notification channels (one class = one channel) | Alert routing to Telegram/Discord/PagerDuty with same pattern |
| Badge generation (SVG embed) | Strategy performance badges for client dashboards |
| Real-time push via Socket.io | Live P&L updates without polling — identical architecture |
| JSON Query monitors | Exchange API health — assert `{"status":"ok"}` from exchange endpoints |
| Recovery notifications | Position closed / risk resolved auto-notification |

---

## Unresolved Questions

1. Does Uptime Kuma support multi-user/role-based access per status page? (Relevant for multi-tenant RaaS)
2. How are historical heartbeat records pruned? (Data retention model for high-frequency trading monitors)
3. Is the WebSocket API documented publicly or reverse-engineered? (Risk for Apex-OS integration)

---

*Sources: github.com/louislam/uptime-kuma README, wiki pages, source analysis*
