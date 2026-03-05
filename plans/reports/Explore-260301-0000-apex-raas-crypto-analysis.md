# APEX OS — RaaS & CRYPTO AGENTIC WORKFLOWS ANALYSIS

**Analysis Date:** March 1, 2026  
**Scope:** Read-only exploration of viral-economics, payments, agents, finance, trading, and auth layers  
**Status Report:** FRAMEWORK FOUNDATION SOLID, CRITICAL GAPS IDENTIFIED

---

## EXECUTIVE SUMMARY

Apex OS has **solid tier and commission architecture**, but faces **critical gaps for "zero-fee crypto agentic RaaS"**:

1. **WORKING:** Tier progression (EXPLORER→OPERATOR→ARCHITECT→SOVEREIGN) based on volume
2. **WORKING:** Referral L1-L4 commission calculation with tier-based rates
3. **WORKING:** Self-rebate distribution on trades (via `processTradeCommission`)
4. **WORKING:** Crypto payment via NOWPayments + Polar (fiat option)
5. **MISSING:** Zero-fee implementation across wallets/balances
6. **MISSING:** Agentic autonomous tier upgrades
7. **MISSING:** Crypto-native agent orchestration (event-bus only partial)
8. **MISSING:** Multi-org/team settlement
9. **BROKEN:** Settlement engine is incomplete stub

---

## LAYER-BY-LAYER ANALYSIS

### 1. TIER SYSTEM (`/src/lib/viral-economics/tier-manager.ts`)

**Status:** ✅ PRODUCTION-READY (with caveats)

**What's Working:**
- Lines 6-27: TIER_CONFIG maps 4 tiers with commission rates and requirements
  - EXPLORER: 0 refs, 0 vol → L1 10% commission
  - OPERATOR: 5 refs, $10K vol → L1 20%, L2 5%
  - ARCHITECT: 20 refs, $100K vol → L1 25%, L2 10%, L3 5%
  - SOVEREIGN: 50 refs, $1M vol → L1 30%, L2 15%, L3 10%, L4 5%
- Lines 34-61: `calculateUserTier()` auto-detects highest tier eligible
- Lines 77-116: `promoteTier()` handles tier upgrades atomically

**What's NOT Working:**
- Line 29: `EXCHANGE_AVG_REBATE_RATE = 0.0008` is hardcoded fallback (should be dynamic)
- No daily/hourly auto-promotion trigger (only manual call or cron)
- No downgrades if user loses refs/volume

**For Zero-Fee RaaS:**
- ✅ Tier structure supports zero subscription
- ⚠️ Spread-based pricing hardcoded in config, not dynamic per exchange
- ⚠️ No "zero-fee pairs" exclusion logic (e.g., BTC/FDUSD trades)

---

### 2. COMMISSION CALCULATOR (`/src/lib/viral-economics/commission-calculator.ts`)

**Status:** ⚠️ PARTIALLY WORKING (critical revenue estimation bug)

**What's Working:**
- Lines 28-114: `calculateMonthlyCommissions()` fetches pool, iterates users, applies scaling
- Lines 117-175: `calculateUserCommission()` computes L1-L4 from referral network
- Lines 177-194: Pool validation caps payout at 90% of available revenue

**What's BROKEN:**
- Line 147: Uses `volume * EXCHANGE_AVG_REBATE_RATE` instead of actual fees
  - **CRITICAL BUG:** If zero-fee pairs exist (BTC/FDUSD = 0 fee), this estimates revenue from them = bankruptcy risk
  - Comment on line 145-146 acknowledges this but doesn't fix it
- Lines 144-158: No account for zero-fee pairs or variable fee structures
- No actual integration with exchange fee API (should fetch from Binance/actual partner)

**For Zero-Fee RaaS:**
- ❌ MUST FIX: Only use actual fees, never estimate
- ❌ MUST ADD: Dynamic fee lookup per symbol/exchange
- ❌ MUST ADD: Skip zero-fee pairs from commission base

---

### 3. REFERRAL MANAGER (`/src/lib/viral-economics/referral-manager.ts`)

**Status:** ⚠️ SCAFFOLDING (major schema assumptions)

**What's Working:**
- Lines 40-97: `processReferralSignup()` creates L1 link and recursively builds L2-L4 network
- Lines 99-113: `updateReferrerMetrics()` counts active referrals
- Lines 115-141: Network depth/metrics queries

**What's NOT Working:**
- Lines 4-37: `createReferralLink()` assumes `user_profiles` table has `referral_code` column
  - Comment says "For MVP, let's assume..." = NOT IMPLEMENTED
  - Actually stores code but nowhere in codebase
- No deterministic code generation (uses nanoid = different code each call)
- `processReferralSignup()` assumes referral_codes table exists (line 47)
  - **Schema mismatch:** No actual `referral_codes` table in migrations found
- Line 119: `referee_volume` updated but never sources from trades

**For Zero-Fee RaaS:**
- ✅ L1-L4 logic sound
- ❌ Need actual `referral_codes` table schema
- ❌ Need webhook from trading engine to update `referee_volume` in realtime

---

### 4. REALTIME COMMISSION (`/src/lib/viral-economics/realtime-commission.ts`)

**Status:** ✅ BEST ENGINEERED, BUT INCOMPLETE

**What's Working:**
- Lines 15-173: `processTradeCommission()` is production-grade:
  - Lines 20-49: Calculates self-rebate from actual fee (not estimate)
  - Lines 51-71: Credits user via RPC `credit_user_balance_realtime`
  - Lines 73-137: Iterates referrers L1-L4, applies tier-based commission
  - Lines 122-135: Each referrer credited atomically
  - Lines 143-167: Updates monthly_volume (commented out RPC fallback)
- Line 37-38: Uses `PARTNER_COMMISSION_SHARE = 0.4` (40% of partner commission)

**What's NOT Working:**
- Lines 38-49: Still falls back to volume estimation if fee missing
  - **FIX NEEDED:** Make fee mandatory, fail loudly if missing
- Lines 144-167: `increment_user_volume` RPC called but with error handling that's commented out
  - **BROKEN:** Volume not reliably updated (needed for tier calc)
- No deduplication (calling this twice for same trade = double commission)
- No idempotency key/nonce in database

**For Zero-Fee RaaS:**
- ✅ Uses actual fees (good)
- ✅ Self-rebate + referral commission logic correct
- ❌ MUST FIX: Make volume updates reliable (not commented-out fallback)
- ❌ MUST ADD: Idempotency key to prevent double-crediting
- ❌ MUST ADD: Webhook validation so only real trades trigger this

---

### 5. GAMIFICATION (`/src/lib/viral-economics/gamification.ts`)

**Status:** ✅ FUNCTIONAL (simple badges only)

**What's Working:**
- Lines 3-9: Badge milestones (1, 10, 50, 100, 500 refs)
- Lines 19-52: `checkBadgeEligibility()` assigns badges
- Lines 54-73: `getLeaderboard()` ranking by referrals

**What's NOT Working:**
- Line 48: `TODO: Send notification` = no actual notification
- Line 81-85: `trackProgress()` returns hardcoded placeholder data
- No achievement points, streaks, or gamification hooks in trading flow

**For Zero-Fee RaaS:**
- ✅ Badges provide psychological lever for growth
- ⚠️ Needs real notifications to drive engagement
- ⚠️ Leaderboard should rank by volume/commission earned, not refs

---

### 6. CRON JOBS (`/src/lib/viral-economics/cron-jobs.ts`)

**Status:** ⚠️ SCHEDULING SHELL ONLY

**What's Working:**
- Lines 8-15: `monthlyCommissionCalculation()` wrapper
- Lines 17-32: `dailyTierCheck()` iterates users and promotes

**What's NOT Working:**
- **CRITICAL:** No actual scheduler! These functions exist but nothing calls them
- Lines 37-38: `hourlyMetricsUpdate()` is stub saying "skipped, event-driven preferred"
- No cron/background job framework connected (need Bull, Inngest, or cron-job service)

**For Zero-Fee RaaS:**
- ❌ MUST IMPLEMENT: Actual cron scheduler (Bull + Redis or serverless function)
- ❌ MUST ADD: Nightly tier checks for all users
- ❌ MUST ADD: Monthly commission settlement job with safety checks

---

### 7. PAYMENT PROCESSING

#### A. POLAR (`/src/lib/payments/polar-client.ts`)

**Status:** ✅ MINIMAL BUT WORKING

**What's Working:**
- Lines 14-41: Polar checkout creation with metadata
- Integrates with product price IDs from config

**What's NOT Working:**
- No webhook handling (needs IPN callback to confirm purchases)
- No subscription management (one-time checkout only)
- No subscription status polling

**For Zero-Fee RaaS:**
- Polar = fiat payment only
- In zero-fee model, Polar used for "premium features" (not tier unlock)
- Need webhook at `/api/webhooks/polar` to confirm and credit account

#### B. NOWPAYMENTS (`/src/lib/payments/nowpayments-client.ts`)

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**What's Working:**
- Lines 26-78: `createNOWPaymentsInvoice()` creates crypto invoice
- Lines 101-142: `createPayout()` and `getPayoutStatus()` for withdrawals
- Lines 80-142: Withdrawal/payout flow with TRC-20 support
- Line 47: Crypto discount support (discount % configurable)

**What's NOT Working:**
- Lines 101-142: No actual integration test (all marked production but untested)
- Line 126: Webhook URL hardcoded but endpoint might not exist
- No retry logic on API failures
- No memo field for reconciliation

**For Zero-Fee RaaS:**
- ✅ Crypto deposits: NOW supports 50+ coins
- ✅ Crypto withdrawals: Payout flow exists
- ❌ MUST ADD: Webhook at `/api/webhooks/nowpayments` to confirm deposits
- ❌ MUST ADD: Crypto discount needs to integrate with tier system

---

### 8. AGENTS

#### A. EVENT BUS (`/src/lib/agent/event-bus.ts`)

**Status:** ⚠️ INCOMPLETE INFRASTRUCTURE

**What's Working:**
- Lines 33-50: `publish()` creates event records in `agent_events` table
- Lines 57-87: `subscribe()` sets up Realtime listeners
- Lines 93-101: `completeEvent()` marks events processed

**What's NOT Working:**
- No polling/retry for missed events
- Realtime subscription only (no fallback to polling)
- Lines 112-118: `failEvent()` overwrites payload instead of appending (says "CAUTION")
- No dead-letter queue for failed events
- No replay capability

**For Zero-Fee RaaS:**
- ✅ Async event pub/sub foundation good
- ❌ MUST ADD: Event replay on agent restart
- ❌ MUST ADD: Dead-letter queue for failed trades/commissions
- ❌ MUST ADD: Polling as fallback to Realtime

#### B. WITHDRAWAL AGENT (`/src/lib/agents/withdrawal-agent.ts`)

**Status:** ✅ WORKING (but simple risk scoring)

**What's Working:**
- Lines 11-113: Comprehensive withdrawal approval flow:
  - Line 26-38: Checksum verification (defense-in-depth)
  - Line 41-82: Risk scoring (amount, velocity, balance checks)
  - Line 75-79: AML blacklist check (hardcoded mock)
  - Line 88-105: Atomic approval + audit logging

**What's NOT Working:**
- Line 75: AML check is hardcoded mock, not real Chainalysis API
- No actual KYC/AML provider integration
- Line 67: Balance consistency check tolerance is tight ($1 = fail)
- No email/SMS notification on large withdrawals

**For Zero-Fee RaaS:**
- ✅ Multi-stage approval good for enterprise
- ❌ MUST IMPLEMENT: Real AML provider (Chainalysis, TRM, Elliptic)
- ❌ MUST ADD: Rate limiting by address (max $X per day)
- ⚠️ Consider: Email notification for high-value withdrawals

#### C. EXECUTION AGENT (`/src/lib/agents/execution-agent.ts`)

**Status:** ✅ WORKING (atomic execution)

**What's Working:**
- Lines 6-135: Complete withdrawal execution:
  - Line 26-35: Checksum re-verification before execution
  - Line 37-41: Status transitions with timestamps
  - Line 44-61: NOW Payments payout call + polling
  - Line 69-95: Status update with tx hash + audit
  - Line 116-131: Error recovery + balance release

**What's NOT Working:**
- Lines 69-77: Polling timeout only 10 seconds (might be too aggressive)
- No retry escalation (if NOW API times out, request fails)
- No SMS notification for large payouts

**For Zero-Fee RaaS:**
- ✅ Atomic state machine good
- ⚠️ Polling interval (2s) OK for < 5 retries (need longer for real production)
- ❌ MUST ADD: Email confirmation code for withdrawal address change

---

### 9. FINANCE LAYER

#### A. VAULT MANAGER (`/src/lib/finance/vault-manager.ts`)

**Status:** ✅ WORKING (catcher mechanism)

**What's Working:**
- Lines 10-33: `captureMissedCommission()` holds funds for 24h pending upgrade
- Lines 39-53: `releaseFunds()` claims held funds atomically via RPC
- Lines 58-71: `getPendingAmount()` for UI display

**What's Working But Incomplete:**
- Logic assumes there's a `claim_pending_vault_funds` RPC but no SQL shown
- 24h grace period hardcoded

**For Zero-Fee RaaS:**
- ✅ Catcher pattern incentivizes tier upgrades
- ❌ MUST VERIFY: `claim_pending_vault_funds` RPC actually exists in DB
- ⚠️ Consider: Longer grace period (7 days) for better UX

#### B. WITHDRAWAL SERVICE (`/src/lib/finance/withdrawal-service.ts`)

**Status:** ⚠️ MOCK/INCOMPLETE

**What's Working:**
- Lines 15-90: Scaffold for withdrawal requests with threshold-based approval
- Multi-sig pattern attempted

**What's NOT Working:**
- Lines 65: Mock tx_hash = `'0x' + Math.random()...`
- No actual integration with agents
- `multiSigService` and `auditService` imported but not verified to exist

**For Zero-Fee RaaS:**
- ❌ This appears to be admin withdrawal, not user withdrawal
- ❌ Should use `execution-agent.ts` + `withdrawal-agent.ts` instead
- ⚠️ Code smell: Mixing admin withdrawals with user withdrawals

#### C. VESTING (`/src/lib/finance/vesting.ts`)

**Status:** ✅ SIMPLE BUT WORKING

**What's Working:**
- 10% TGE unlock + linear 12-month vesting
- Used for token distributions (not commissions)

---

### 10. TRADING SETTLEMENT (`/src/lib/trading/settlement.ts`)

**Status:** ❌ STUB/INCOMPLETE

**What's Working:**
- Lines 1-3: Stub for `settleCopyProfit()`
- Lines 31-76: `settleFollowerProfit()` has logic flow

**What's NOT Working:**
- Line 3: Function returns immediately if pnl <= 0 (no actual settlement)
- Lines 8-24: `settleCopyProfit()` incomplete, questions about schema (line 12-15)
- Lines 49-76: Deduction/credit logic is incomplete, comments suggest RPC might not exist
- No idempotency on profit settlements

**For Zero-Fee RaaS:**
- ❌ MUST IMPLEMENT: Complete settlement engine
- ❌ MUST ADD: Idempotency key (don't settle same trade twice)
- ❌ MUST VERIFY: Schema has proper FK from copy_positions → virtual_positions
- ⚠️ Copy trading on paper trading = how to handle profit settlement? (unclear)

---

### 11. DATABASE MIGRATIONS

#### Teams Support (`add_teams.sql`)

**Status:** ✅ BASIC STRUCTURE PRESENT

**What's Working:**
- Lines 2-9: `teams` table with leader_id, invite_code
- Lines 12-18: Team membership (users.team_id, team_role)

**What's NOT Working:**
- No team wallet (where do team earnings go?)
- No team commission split rules
- team_role enum only suggests 'alpha', 'beta', 'member' but no actual enum type
- No team hierarchy (sub-teams, departments)

**For Zero-Fee RaaS:**
- ❌ MUST ADD: Team wallet and earnings pool
- ❌ MUST ADD: Team commission split configuration
- ❌ MUST ADD: Team onboarding flow in UI

#### No Multi-Org/SaaS Schema Found

- No `organizations` or `accounts` table
- No tenant isolation
- Only teams, which are tied to users

**For Zero-Fee RaaS with Multi-Org:**
- ⚠️ Current architecture is single-org (Apex)
- To support white-label/partners: need full multi-tenancy schema redesign

---

### 12. CONFIG: UNIFIED TIERS (`/src/config/unified-tiers.ts`)

**Status:** ✅ WELL-DESIGNED, ZERO-FEE MODEL CORRECT

**What's Working:**
- Lines 20-38: `RAAS_CONFIG` defines crypto gates (5 chains, 4 stablecoins)
- Lines 40-218: All 4 tiers with correct commission rates
  - Lines 59-66: EXPLORER: 10% self-rebate, 10% L1
  - Lines 102-109: OPERATOR: 20% self-rebate, 20% L1 + 5% L2
  - Lines 146-153: ARCHITECT: 30% self-rebate, 25% L1 + 10% L2 + 5% L3
  - Lines 190-197: SOVEREIGN: 50% self-rebate, 30% L1 + 15% L2 + 10% L3 + 5% L4
- Lines 237-284: Helper functions for tier lookup, rate extraction, volume-based tier calc
- Lines 289-295: Auto tier calc from volume (getTierByVolume)

**What's NOT Working:**
- Lines 82-83, 127-128, 171-172, 215-216: `polar: null`, `nowPayments: null` everywhere
  - Means NO crypto payment configured in tiers
  - No fiat payment IDs linked either
- Line 264: `getTierPrice()` returns 0 (correct for RaaS but might confuse legacy code)

**For Zero-Fee RaaS:**
- ✅ Model is conceptually correct (zero subscription, spread-based)
- ✅ Commission rates look sane (total for SOVEREIGN = 110% but includes self-rebate deduction)
- ❌ MUST FIX: Populate `polar` and `nowPayments` product IDs
- ⚠️ VERIFY: Spread rates (spreadBps) are what's actually charged in trading

---

## CRITICAL FINDINGS: ZERO-FEE CRYPTO AGENTIC RaaS

### What MUST CHANGE for "Zero-Fee Crypto Agentic RaaS":

| **Area** | **Current State** | **Need for Zero-Fee RaaS** | **Effort** |
|----------|------|---------|---------|
| **Fee Estimation** | Hardcoded `EXCHANGE_AVG_REBATE_RATE` | Dynamic fees per symbol/exchange | 🔴 HIGH |
| **Zero-Fee Pairs** | No special handling | Must skip or handle separately | 🔴 HIGH |
| **Commission Idempotency** | No dedup key | Prevent double-crediting trades | 🟡 MEDIUM |
| **Volume Tracking** | RPC commented out | Reliable volume updates for tier calc | 🟡 MEDIUM |
| **Tier Auto-Upgrade** | Manual/cron only | Agentic auto-detection on every trade | 🟡 MEDIUM |
| **Referral Schema** | `referral_codes` table missing | Actual implementation needed | 🟡 MEDIUM |
| **Agent Orchestration** | Event-bus only | Full agentic workflow (tier→payout→settlement) | 🔴 HIGH |
| **Settlement Engine** | Stub/incomplete | Full P2P settlement for copy trading | 🔴 HIGH |
| **Multi-Org Support** | Single-org only | Team wallets + earnings pools | 🔴 HIGH |
| **Crypto Gate Config** | No integration | Link NOW Payments + Polar in tier config | 🟡 MEDIUM |
| **Withdrawal Flow** | Agents exist but untested | Full E2E testing + real webhook handlers | 🟡 MEDIUM |
| **AML Integration** | Hardcoded mock | Real provider (Chainalysis/TRM) | 🔴 HIGH |
| **Notification System** | Stubs everywhere | Email + SMS for trades/withdrawals | 🟡 MEDIUM |
| **Cron Scheduling** | No actual scheduler | Background job framework (Bull/Inngest) | 🟡 MEDIUM |

---

## RECOMMENDATION: 3-PHASE IMPLEMENTATION ROADMAP

### Phase 1: CRITICAL (Week 1)
1. Implement actual cron scheduler (Bull + Redis)
2. Fix fee estimation: fetch actual fees per symbol
3. Add idempotency keys to commission transactions
4. Fix volume tracking (uncomment/implement RPC)
5. Implement referral_codes table + management

### Phase 2: IMPORTANT (Week 2)
1. Complete settlement engine for copy trading
2. Implement full agent orchestration (tier detection on trade)
3. Add webhook handlers for NOW Payments + Polar
4. Implement AML integration (Chainalysis API)
5. Add email notifications for withdrawals

### Phase 3: ENHANCEMENT (Week 3)
1. Multi-org/team wallets architecture
2. Advanced gamification (streaks, challenges)
3. Admin dashboard for commission monitoring
4. Real-time analytics for tier/commission tracking
5. Mobile app support (auth tokens)

---

## FILES NOT FOUND (EXPECTED BUT MISSING)

- `src/database/migrations/*commission*.sql` - No schema shown
- `src/database/migrations/*user_wallets*.sql` - No wallet balance tracking
- `src/database/migrations/*referral_codes*.sql` - Schema missing
- `src/api/webhooks/nowpayments.ts` - Webhook handler missing
- `src/api/webhooks/polar.ts` - Webhook handler missing
- `src/lib/scheduler.ts` - Background job scheduler missing
- `src/lib/security/multi-sig.ts` - Referenced but not provided
- `src/lib/audit.ts` - Referenced but not provided

---

## SEVERITY LEVELS

- 🔴 **CRITICAL:** Code will not work correctly for zero-fee RaaS
- 🟡 **MEDIUM:** Code exists but incomplete/untested
- 🟢 **LOW:** Polish/documentation only

**Bottom Line:** Framework is 60% complete. Core commission logic solid, but agentic orchestration and crypto integration are stubs. Can ship MVP with manual tier upgrades + fiat-only payments, but zero-fee crypto RaaS requires 2-3 weeks of engineering.

