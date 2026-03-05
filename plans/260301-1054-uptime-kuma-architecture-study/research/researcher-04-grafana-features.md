# Grafana Features & UX Patterns — RaaS Trading Platform Inspiration

Date: 2026-03-01 | Researcher: 04

---

## 1. Explore & Query Builder

**Dual-mode editor:** Code (raw PromQL/SQL with autocomplete + syntax highlight) vs Builder (visual, point-and-click). Toggle between modes without losing query state.

**Builder UX components:**
- Metric selector → label filter picker → operation chaining (+Operations button)
- Operation categories: aggregations, functions, range vectors — each with inline tooltip docs
- **Explain mode**: step-by-step human-readable breakdown of every query component
- Metrics Explorer: paginated table of all available metrics (name/type/description) with search

**SQL editor:** MySQL/Postgres editors add time macro helpers (`$__timeFilter`, `$__interval`) that auto-inject dashboard time range into queries.

**Query history:** Per-datasource query history panel; starred queries persist across sessions.

**RaaS Applicability:** Build a visual strategy query builder (entry conditions, indicator params) with Code/Builder toggle. Explain mode maps well to "why did this signal fire?" UX.

---

## 2. Alerting UX

**Alert rule creation flow:**
1. Define query + expression (uses same query editor as dashboards)
2. Set threshold / reduce / math expressions on query results
3. Configure evaluation interval + pending period (avoid flapping)
4. Assign labels → labels drive routing via Notification Policy tree

**Contact points:** Pluggable destinations (Slack, PagerDuty, webhook, email). Each contact point configurable with Go templates for message body.

**Notification Policy tree:** Visual tree where each node matches label selectors → routes to contact points. Supports mute timings (suppress nights/weekends), grouping keys (batch related alerts), repeat intervals.

**Silences:** Time-bounded label-matcher silences; "Preview affected alerts" before saving.

**RBAC for alerting:** Granular permissions — can grant `alert.rules:read` without `alert.rules:write`; contact point visibility can be restricted per role.

**RaaS Applicability:** Alert on drawdown/risk threshold breaches. Notification policy tree = route by strategy/portfolio labels. Mute timings = suppress alerts during known low-liquidity windows.

---

## 3. Dashboard Variables & Templating

**Variable types:**
- `Query` — datasource query result (e.g., all active strategies)
- `Custom` — static comma-separated list
- `Constant` — hidden, for dashboard linking
- `Interval` — time bucket ($__interval substitution)
- `Data source` — switch entire data source per view
- `Text box` — free-form user input

**Multi-value + All option:** Variables support multiple selections; Grafana formats them per-datasource (CSV, regex, pipe-delimited) automatically.

**Chained variables:** Variable B query can reference `$varA` — e.g., "exchange" variable filters "symbol" variable downstream.

**Repeating panels/rows:** Panel configured with `Repeat by variable` → Grafana clones panel N times (one per selected value), auto-layouts in grid. Repeat direction: horizontal or vertical.

**Dynamic dashboard generation:** Select 5 strategies from dropdown → 5 identical PnL panels auto-spawn. No manual duplication.

**RaaS Applicability:** Variables for `$org`, `$strategy`, `$exchange`, `$timeframe`. Repeating panels = per-agent performance cards. Chained vars = org → portfolio → strategy hierarchy.

---

## 4. Annotations & Event Overlay

**Annotation sources:**
- Manual (click on graph → add note)
- Query-based (fetch events from any datasource, e.g., "all trades from DB")
- Built-in (alert state changes auto-annotated as colored regions)

**Visual rendering:** Vertical colored lines + icon markers on time-series; hover tooltip shows event metadata. Alert annotations = colored background band (pending=yellow, firing=red, resolved=green).

**Dashboard-wide vs panel-specific:** Annotation queries can target all panels, selected panels, or exclude specific panels.

**Time regions:** Mark recurring time windows (e.g., market open/close Mon-Fri 09:30-16:00) as background bands.

**RaaS Applicability:** Overlay trade executions, agent decisions, rebalance events, regime change detections on PnL charts. Color-code by agent or signal type. Time regions = mark trading sessions.

---

## 5. Organization & RBAC

**Multi-org model:** Each Organization is a fully isolated tenant (own users, dashboards, datasources, alerts). Switching orgs = full context switch. Super Admin can manage all orgs.

**Folder structure:** Dashboards organized in folders. Permissions set at folder level → inherited by dashboards inside.

**Teams:** Groups of users. Folder/dashboard permissions assignable to teams, not just individual users.

**RBAC roles (Grafana Enterprise/Cloud):**
- Built-in: Viewer / Editor / Admin / Super Admin
- Custom roles: fine-grained actions like `dashboards:read`, `datasources:query`, `alert.rules:write`
- Role assignments: user-level, team-level, org-level

**Service accounts:** Non-human accounts with API tokens for automation/CI.

**RaaS Applicability:**
- Multi-org = multi-client isolation (each trading firm = org)
- Folders = strategy families; teams = portfolio managers vs risk ops
- Custom roles = traders can view but not edit alert rules; compliance team read-only across all orgs
- Service accounts = agent workers that push metrics via API

---

## Key UX Patterns for RaaS Trading Dashboards

| Pattern | Grafana Mechanism | Trading Platform Use |
|---|---|---|
| Dynamic per-strategy panels | Repeat panels by variable | Auto-spawn agent performance cards |
| Drill-down filtering | Chained template variables | Org → Portfolio → Strategy hierarchy |
| Trade event overlay | Query-based annotations | Mark entries/exits on PnL time series |
| Risk alert routing | Notification policy tree + labels | Route by strategy risk tier |
| Multi-tenant isolation | Organizations + folder RBAC | Per-client data isolation |
| Visual query building | Builder/Code/Explain toggle | No-code signal condition builder |
| Market session marking | Time region annotations | Highlight trading vs non-trading hours |

---

## Sources
- [Prometheus query editor docs](https://grafana.com/docs/grafana/latest/datasources/prometheus/query-editor/)
- [Grafana 9 query builder announcement](https://grafana.com/blog/2022/07/18/new-in-grafana-9-the-prometheus-query-builder-makes-writing-promql-queries-easier/)
- [Dashboard variables docs](https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/)
- [RBAC docs](https://grafana.com/docs/grafana/latest/administration/roles-and-permissions/access-control/)
- [Annotations docs](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/)
- [Repeating panels guide](https://grafana.com/blog/2020/06/09/learn-grafana-how-to-automatically-repeat-rows-and-panels-in-dynamic-dashboards/)
- [Alerting templating guide](https://grafana.com/blog/2023/04/05/grafana-alerting-a-beginners-guide-to-templating-alert-notifications/)

---

## Unresolved Questions
- Grafana's new "Scenes" library (2024) for programmatic dashboard generation — depth of API?
- Public dashboards feature: anonymous access to specific dashboards — auth model details?
- Data source permissions: can per-query datasource access be restricted below the org level?
