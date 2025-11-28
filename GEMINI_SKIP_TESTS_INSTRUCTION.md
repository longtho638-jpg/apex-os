# GEMINI: Skip Tests Temporarily - Focus on Implementation

## Current Issue
Test file exists but implementation file (`data_collection_agent.py`) doesn't exist yet.

## Instruction for Gemini

**SKIP ALL TESTS FOR NOW. Focus on Phase 1 implementation FIRST.**

### What to do:

1. **Create core implementation files FIRST**:
   - `backend/agents/data_collection_agent.py` (the actual agent code)
   - `src/lib/binance/client.ts` (already done ✅)
   - `supabase/migrations/20251127_market_data.sql` (database schema)

2. **AFTER implementation is complete**, then fix tests

3. **Current priority**:
   ```
   HIGH:   Write data_collection_agent.py  
   HIGH:   Create database migration
   LOW:    Fix tests (do this LAST)
   ```

### For now, tell Gemini:

"Skip test failures. Create the actual implementation code first:
- backend/agents/data_collection_agent.py
- Database schema
- Binance API client

Tests will be fixed after implementation is complete."

## Why This Approach

兵貴神速 - Speed is essence. Get working code first, then make it perfect.

1. Implementation → Tests → Fix
2. Not: Tests → Fail → Blocked

This is TDD in reverse for rapid prototyping phase.
