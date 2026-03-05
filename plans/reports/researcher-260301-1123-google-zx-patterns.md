# Google/ZX Shell Scripting Patterns Research Report

**Date:** 2026-03-01 | **Scope:** Applicable patterns for trading platform background services

---

## Summary

ZX (google/zx) wraps Node.js `child_process` with safe defaults. 5 directly applicable patterns for trading backend.

---

## 1. Template Literal Command Safety (CRITICAL)

**Pattern:** Use `$` tagged template literals instead of string concatenation.

```javascript
// ✅ SAFE - Variables auto-escaped
const branch = 'main'
await $`git checkout ${branch}`

// ❌ UNSAFE - String concat vulnerable to injection
await execSync(`git checkout ${branch}`)
```

**Application:** Trading service CLI commands (deploy, restart, sync). Prevents shell injection via market tickers or user input.

---

## 2. Error Handling with `nothrow` Option

**Pattern:** Suppress exceptions, inspect exit codes instead.

```javascript
// ✅ Non-blocking error capture
const result = await $({ nothrow: true })`systemctl status trading-engine`
if (!result.ok) {
  console.log(`Service failed: ${result.exitCode}`)
}

// ❌ Default throws on non-zero
try {
  await $`systemctl status trading-engine`
} catch (p) {
  console.log(`Exit: ${p.exitCode}, Signal: ${p.signal}`)
}
```

**Application:** Health checks, graceful degradation when services (Redis, Postgres) are down.

---

## 3. Concurrent Process Management

**Pattern:** Spawn multiple background services in parallel via `Promise.all()`.

```javascript
// ✅ Parallel service boot
await Promise.all([
  $`npm run service:market-feed`,
  $`npm run service:order-handler`,
  $`npm run service:position-calculator`,
  $`npm run service:webhook-dispatcher`
])

// ✅ Timeout protection
const result = await $({ timeout: 30000 })`long-running-backtest`
```

**Application:** Orchestrate 4+ background services in trading-engine startup without sequential blocking.

---

## 4. Process Lifecycle Control with AbortController

**Pattern:** Kill hanging processes gracefully.

```javascript
// ✅ Kill after timeout
const controller = new AbortController()
setTimeout(() => controller.abort(), 5000)
try {
  await $({ signal: controller.signal })`npm run backtest:full`
} catch (p) {
  if (p.signal === 'SIGTERM') console.log('Backtest killed')
}
```

**Application:** Kill stalled backtests, prevent zombie processes in multi-tenant scenario.

---

## 5. Shell Output Piping & Chaining

**Pattern:** Pipe output between commands and capture structured results.

```javascript
// ✅ Direct piping
const priceData = await $`curl https://api.exchange.com/prices | jq '.data'`

// ✅ Readable stream to command
const logs = await $`cat trading-engine.log`
await logs.pipe($`grep ERROR`)

// ✅ String input to command
const csvData = 'BTC,USD,45000\nETH,USD,3000'
await $`echo ${csvData} | psql -c "COPY prices FROM STDIN"`
```

**Application:** Feed market data via pipes, log aggregation, bulk DB inserts for tick data.

---

## Applicable Patterns Summary

| Pattern | Risk | Use For | Your Backend |
|---------|------|---------|--------------|
| Template literals | LOW (auto-escape) | All shell calls | CLI commands, API gateway restarts |
| `nothrow` handling | LOW | Graceful failure | Service health checks, monitoring |
| `Promise.all()` | MEDIUM (race conditions) | Parallel boot | Multi-service startup orchestration |
| AbortController | MEDIUM (timing) | Timeout control | Backtest killer, stalled task cleanup |
| Piping | LOW (streaming) | Data flow | Market feed ingestion, log processing |

---

## Implementation Priorities for Trading Backend

1. **Phase 1 (CRITICAL):** Replace `execSync()` calls with `$` template literals (security + cross-platform)
2. **Phase 2 (HIGH):** Wrap service startup in `Promise.all()` + `nothrow` health checks
3. **Phase 3 (MEDIUM):** Add AbortController for long-running backtests (timeout + graceful kill)
4. **Phase 4 (LOW):** Leverage piping for market data CLI scripts (optional optimization)

---

## Unresolved Questions

- Does ZX handle stdin/stdout buffering limits for high-frequency market data (1000s of ticks/sec)?
- How to manage zombie processes when AbortController signal is ignored?
- Native support for process pooling (worker threads) or defer to Bull/Node cluster module?

---

_Report: researcher-260301-1123-google-zx-patterns.md_
