# Phase 2: Trading IPC Event Bus (Electron-Inspired)

**Status:** pending | **Priority:** HIGH

## Context

- [Electron Report](../reports/researcher-260301-1547-electron-raas-trading-patterns.md)

## Overview

Apply Electron's IPC patterns (invoke/handle, pub/sub, filtered messaging) to create a typed trading event bus for inter-service communication.

## Key Insights

- Electron's main process = order authority (immune to UI crashes)
- invoke/handle pattern = request-response for order placement
- pub/sub pattern = real-time price/position streams
- Preload filter = only expose safe methods to UI layer

## Requirements

### Functional
- Typed event channels with handler registration
- Request-response pattern for order execution
- Pub/sub pattern for price/position streams
- Memory event channel for agent memory operations

### Non-Functional
- Leverage existing Redis pub/sub infrastructure
- TypeScript strict types for all channels
- No new dependencies

## Architecture

```
backend/events/
├── trading-event-bus.ts          # Central event bus (Electron main process pattern)
├── trading-event-channels.ts     # Channel type definitions
└── trading-event-handlers.ts     # Handler registry + dispatch
```

## Implementation Steps

1. Create `trading-event-channels.ts` — Define typed channels
2. Create `trading-event-bus.ts` — EventEmitter with typed invoke/handle + pub/sub
3. Create `trading-event-handlers.ts` — Register handlers for trade/price/memory channels

## Success Criteria

- [ ] Typed channels for trades, prices, agents, risk
- [ ] invoke/handle pattern for order execution
- [ ] pub/sub pattern for real-time streams
- [ ] Memory events integrated with Phase 1
