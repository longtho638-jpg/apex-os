# Grafana Core Architecture — Research Report
**Date:** 2026-03-01 | **Focus:** Patterns for trading platform

---

## 1. Dashboard & Panel System

### Model
- Dashboards stored as **JSON** (schema-versioned). YAML config files point to JSON locations on disk.
- Each panel is a self-contained config object: `{ type, datasource, targets[], fieldConfig, options }`.
- **Variable templating**: `$variable` syntax → query-time substitution. Variables can be query-driven (e.g., "list all indices from Elasticsearch") or static. Dashboard re-renders on variable change without full reload.
- Panel plugins are frontend React components receiving a `PanelData` prop (DataFrame array). Plugins declare their config options via a JSON schema; Grafana auto-generates the editor UI.

### Key Pattern
> Dashboard = JSON spec + runtime variable interpolation + plugin renderer. The dashboard engine is a thin coordinator—it resolves variables, dispatches queries to data sources, and pipes DataFrames to panel components.

### Trading Platform Applicability
- Define trading dashboards (P&L, order book, positions) as JSON → store in git → deploy via provisioning API.
- Variables for `$symbol`, `$timeframe`, `$exchange` filter all panels simultaneously with zero custom code.

---

## 2. Alerting Engine (Unified Alerting)

### Architecture (Prometheus-inspired)
```
Alert Rules (evaluation scheduler)
    │  periodic eval against datasource queries
    ▼
Alert Instances (per time-series dimension)
    │  state: Normal → Pending → Firing → Resolved
    ▼
Alertmanager (embedded or external)
    │  grouping, deduplication, inhibition, silences
    ▼
Notification Policies (tree routing)
    │  match labels → select contact point
    ▼
Contact Points (Slack, PagerDuty, webhook, email…)
```

### Core Concepts
- **Alert Rule**: query + condition threshold + evaluation interval + pending period (prevents flapping).
- **Labels**: key-value pairs on each alert instance — used for routing + grouping. Labels inherit from datasource query (e.g., `instance="server1"`).
- **Notification Policy tree**: root default policy + child matchers. An instance walks the tree, matching on labels → assigned to contact point.
- **Silences**: label-matcher based, time-bound — suppress notifications without deleting rules.
- **State history**: stored in database; allows "how long was this alert firing?" queries.

### Key Pattern
> Decouple rule evaluation from notification routing. Labels are the universal routing key — they flow from the datasource query through the alert instance into the notification policy matcher.

### Trading Platform Applicability
- Alert rules: `price_deviation > 3%`, `order_fill_latency > 200ms`, `position_drawdown > threshold`.
- Labels `{ symbol, exchange, strategy }` → route to different contact points per strategy team.
- Silences for planned maintenance windows / market close hours.
- Pending period prevents alerts on transient market spikes.

---

## 3. Data Source Plugin Architecture

### Plugin Types
- **Frontend-only**: TypeScript class implementing `DataSourceApi<TQuery, TOptions>`.
  - `query(request: DataQueryRequest): Observable<DataQueryResponse>` — returns DataFrames.
  - `testDatasource(): Promise<{ status, message }>` — health check.
- **Backend plugin** (Go): needed for server-side queries, auth proxying, streaming. Implements gRPC interface `QueryData`, `CheckHealth`, `CallResource`.
- Frontend and backend communicate via HTTP through the Grafana plugin proxy — datasource credentials never exposed to the browser.

### Query Model
```
DataQueryRequest {
  targets: TQuery[]        // plugin-specific query config
  range: TimeRange
  intervalMs: number       // panel refresh interval
  maxDataPoints: number
  scopedVars: ScopedVars   // resolved template variables
}
→ DataQueryResponse {
  data: DataFrame[]        // columnar: fields with name, type, values[]
}
```

### Key Pattern
> Every data source, regardless of underlying protocol (SQL, REST, WebSocket, GRPC), exposes the same `query()` → `DataFrame[]` contract. Panels are data-source agnostic.

### Trading Platform Applicability
- Build one plugin per exchange/broker API → same panel components reuse across all.
- Backend plugin for authenticated order flow (credentials stay server-side).
- Mixed datasources per panel: overlay order fills (DB) with price candles (market data API).

---

## 4. Real-time & Streaming (Grafana Live)

### Architecture
- **Grafana Live**: WebSocket-based Pub/Sub built on [Centrifuge](https://github.com/centrifugal/centrifuge).
- All panel subscriptions on a dashboard multiplexed over **one** WebSocket connection per browser tab.
- Channels identified by `scope/namespace/path` (e.g., `grafana/dashboard/uid`).
- Publisher: datasource backend pushes DataFrames to a channel. Subscriber: panel frontend receives and appends.

### Streaming Datasource Pattern
```
Backend Plugin
  → goroutine polls/subscribes to upstream (exchange WS / kafka / tick feed)
  → calls channelPublisher.Publish(channelID, dataFrame)

Frontend Panel
  → subscribes via Grafana Live SDK: useDataFrame(channelID)
  → receives incremental DataFrame updates → appends to buffer → re-renders
```

### Limits
- Default: in-memory PUB/SUB — single Grafana instance only.
- HA: requires Redis adapter for cross-instance pub/sub.
- ~50 KB RAM per persistent connection; 1 GB RAM ≈ 20k connections max.

### Key Pattern
> Single WebSocket multiplexed over N channels = low overhead. Backend plugin owns the upstream connection; frontend just subscribes to a logical channel name.

### Trading Platform Applicability
- Real-time tick data: backend plugin subscribes to exchange WebSocket, publishes to `stream/prices/$symbol`.
- Order book depth: each symbol = one channel; panels for BTC/ETH/SOL subscribe independently.
- Redis adapter required for multi-node trading platform deployments.

---

## 5. Provisioning & Infrastructure-as-Code

### Mechanisms
| Tool | Format | Scope |
|------|--------|-------|
| File provisioning | YAML (config) + JSON (dashboard) | Dashboards, datasources, alert rules, contact points |
| Grizzly (`grr`) | Kubernetes-style YAML | All resources, git-ops friendly |
| Terraform provider | HCL | Full lifecycle management, state tracking |
| Grafana Operator | CRDs | Kubernetes-native |

### File Provisioning Flow
```
conf/provisioning/
  dashboards/
    sample.yaml          # provider: path, updateIntervalSeconds, foldersFromFilesStructure
  datasources/
    datasource.yaml      # apiVersion, datasources[]
  alerting/
    rules.yaml           # groups, rules, annotations
    contactpoints.yaml
    policies.yaml
```
Grafana watches provisioning dirs at runtime — changes applied without restart.

### Key Pattern
> Dashboards = JSON artifacts in git. YAML config = pointer to JSON + metadata. CI/CD pipeline validates JSON schema → deploys to provisioning dir → Grafana auto-loads.

### Trading Platform Applicability
- Per-environment dashboards (dev/staging/prod) via variable injection at provision time.
- Alert rules as code — PR review for any new trading alert before it goes live.
- Terraform for full lifecycle: datasource credentials in Vault → Terraform → Grafana.

---

## Architectural Patterns Summary (for Trading Platform)

| Pattern | Grafana Mechanism | Trading Use |
|---------|-------------------|-------------|
| Universal query contract | `DataFrame[]` interface | Decouple panels from exchange APIs |
| Label-based routing | Alert labels + notification policies | Route alerts by strategy/exchange/symbol |
| Variable-driven dashboards | Template variables | Single dashboard template per asset class |
| Multiplexed real-time | Grafana Live (Centrifuge) | N symbols, one WS connection |
| GitOps configuration | JSON + YAML provisioning | Dashboard version control, rollback |
| Pending period | Alert evaluation states | Prevent false fires on market noise |

---

## Unresolved Questions
1. Grafana Live HA with Redis — does it support guaranteed delivery or fire-and-forget only?
2. Max alert rule evaluation frequency — can rules fire < 10s intervals for tick-level trading alerts?
3. Backend plugin streaming: max throughput benchmarks for high-frequency tick data (100+ updates/sec per symbol)?
4. Dashboard JSON schema versioning — migration path when panel plugin schema changes?
