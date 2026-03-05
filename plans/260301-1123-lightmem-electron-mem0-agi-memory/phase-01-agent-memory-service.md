# Phase 1: Agent Memory Service (LightMem + Mem0 Inspired)

**Status:** pending | **Priority:** HIGH

## Context

- [LightMem Report](../reports/researcher-260301-0930-lightmem-deep-study.md)
- [Mem0 Report](../reports/researcher-260301-0830-mem0-raas-trading-architecture.md)
- [OpenClaw Scout Report](from explorer agent)

## Overview

Create a 3-tier agent memory service for Apex OS trading agents, inspired by LightMem's sensory→short→long architecture and Mem0's scoping/consolidation patterns.

## Key Insights

- LightMem achieves 117x token reduction via compression + topic segmentation
- Mem0's ADD/UPDATE/DELETE/NOOP consolidation prevents memory duplication
- Both use embeddings for semantic retrieval but LightMem adds offline "sleep-time" updates
- Trading agents need: working memory (live positions), episodic memory (trade history), semantic memory (market patterns)

## Requirements

### Functional
- 3-tier memory: sensory (compress), short-term (structured), long-term (consolidated)
- Multi-agent scoping: agent_id, session_id isolation
- Memory operations: add, search, update, consolidate
- Relevance scoring: recency + importance + similarity
- Background consolidation (non-blocking)

### Non-Functional
- No new infrastructure dependencies (use existing Redis + Supabase)
- TypeScript, follows existing code patterns
- File size < 200 lines per module

## Architecture

```
backend/memory/
├── agent-memory-service.ts       # Main facade (add/search/consolidate)
├── memory-entry.ts               # MemoryEntry type + factory
├── sensory-memory-compressor.ts  # Topic segmentation + compression
├── short-term-memory-store.ts    # In-memory structured store
├── long-term-memory-consolidator.ts # Background offline updates
└── memory-relevance-scorer.ts    # Multi-factor relevance scoring
```

## Implementation Steps

1. Create `memory-entry.ts` — MemoryEntry interface + factory
2. Create `sensory-memory-compressor.ts` — Compress + topic-segment incoming data
3. Create `short-term-memory-store.ts` — In-memory store with Map<agentId, MemoryEntry[]>
4. Create `memory-relevance-scorer.ts` — Score = 0.5*recency + 0.3*importance + 0.2*frequency
5. Create `long-term-memory-consolidator.ts` — Background merge similar entries
6. Create `agent-memory-service.ts` — Facade combining all layers

## Success Criteria

- [ ] MemoryEntry type defined with all fields
- [ ] Sensory compression reduces token count by 50%+
- [ ] Short-term store scoped per agent_id
- [ ] Relevance scorer ranks by multi-factor
- [ ] Consolidator merges duplicates in background
- [ ] Service facade exposes clean API
