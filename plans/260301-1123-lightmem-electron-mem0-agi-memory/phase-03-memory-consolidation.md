# Phase 3: Memory Consolidation Pipeline (Mem0-Inspired)

**Status:** pending | **Priority:** MEDIUM

## Context

- [Mem0 Report](../reports/researcher-260301-0830-mem0-raas-trading-architecture.md)
- [LightMem Report](../reports/researcher-260301-0930-lightmem-deep-study.md)

## Overview

Background consolidation worker that runs "sleep-time" updates — merging, deduplicating, and scoring agent memories without blocking inference.

## Key Insights

- LightMem's offline update: decouple consolidation from online inference
- Mem0's ADD/UPDATE/DELETE/NOOP gate: LLM decides merge action
- Relevance decay: older memories with low access frequency score lower
- Trading context: end-of-session consolidation = "what did we learn today?"

## Requirements

- Background worker runs on configurable interval (default: every 5 min)
- Similarity-based dedup: merge memories with >0.8 cosine similarity
- Time-decay scoring: reduce relevance of stale entries
- Session summary generation: aggregate daily trading insights

## Architecture

```
backend/memory/
└── long-term-memory-consolidator.ts  # (from Phase 1, extended here)

backend/workers/
└── memory-consolidation-worker.ts    # Cron-style background runner
```

## Implementation Steps

1. Extend `long-term-memory-consolidator.ts` with similarity-based merge
2. Create `memory-consolidation-worker.ts` — setInterval runner
3. Wire into existing service startup

## Success Criteria

- [ ] Consolidator merges similar memories (>0.8 threshold)
- [ ] Time-decay reduces stale memory scores
- [ ] Worker runs on interval without blocking
- [ ] Session summary generated at end-of-day
