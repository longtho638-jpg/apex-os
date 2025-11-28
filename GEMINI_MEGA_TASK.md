# 🎯 GEMINI MEGA TASK - WEEK 1 COMPLETE + WEEK 2 PREP
## **HEAVY DUTY MISSION - MAXIMIZE 2000 REQUESTS**

**Priority**: CRITICAL P0  
**Assigned**: 2025-11-27 11:12  
**Deadline**: Complete ALL tasks in this session  
**Executor**: Gemini CLI  
**Quota**: Use freely - 2000 requests available

---

## 🎖️ **MISSION OBJECTIVE**

Complete **ENTIRE Week 1 "Safety Net" Sprint** + Prepare **Week 2 "Brain Build"** foundation.

### **Success Criteria**:
- ✅ Week 1: 100% complete (currently 30%)
- ✅ Production-ready monitoring & security
- ✅ Week 2: Architecture designed, code skeleton ready
- ✅ Zero technical debt maintained
- ✅ All implementations tested & verified
- ✅ Documentation updated

---

## 📋 **PART 1: WEEK 1 "SAFETY NET" - COMPLETE IMPLEMENTATION** 

### **Task 1.1: Sentry Full Setup** ⚡ CRITICAL
**Duration**: 4 hours work → 15 mins for you  
**Impact**: HIGH (no monitoring = flying blind)

**Actions**:
1. **Review current state**:
   - Check `src/lib/monitoring/sentry.ts`
   - Check if Sentry SDK installed: `npm list @sentry/nextjs`
   - Review `.env.local` for SENTRY_DSN

2. **Implementation**:
   - If Sentry not installed: `npm install @sentry/nextjs`
   - Create/update `sentry.client.config.ts` in root
   - Create/update `sentry.server.config.ts` in root
   - Update `src/lib/monitoring/sentry.ts` with real implementation
   - Add error boundary in `src/app/error.tsx`
   - Add global error handler in `src/app/layout.tsx`

3. **Configuration**:
   - Environment: production, staging, development
   - Sample rate: 1.0 for errors, 0.1 for transactions
   - Ignore patterns: common false positives
   - User context tracking
   - Performance monitoring

4. **Testing**:
   - Create test route that throws error
   - Verify error captured in Sentry
   - Check source maps uploaded
   - Document DSN setup in README

**Deliverables**:
- [ ] `sentry.client.config.ts` - Client-side config
- [ ] `sentry.server.config.ts` - Server-side config
- [ ] Updated `src/lib/monitoring/sentry.ts` - Real implementation
- [ ] `src/app/error.tsx` - Error boundary
- [ ] Test error route working
- [ ] Documentation in `docs/SENTRY_SETUP.md`

---

### **Task 1.2: Redis Rate Limiter - Audit & Fix** 🔒 CRITICAL
**Duration**: 2 hours work → 10 mins for you

**Actions**:
1. **Audit current implementation**:
   - Review `src/lib/rate-limit.ts`
   - Check Redis connection logic
   - Check environment variables (REDIS_URL)
   - Test with mock data

2. **Fix issues**:
   - Ensure Redis client properly initialized
   - Add connection retry logic
   - Add graceful degradation (if Redis down, allow but log)
   - Add connection pool management
   - Fix any TypeScript errors

3. **Testing**:
   - Unit tests for rate limit logic
   - Integration test with real Redis (if available)
   - Stress test: 1000 requests/second
   - Verify limits enforced correctly

4. **Documentation**:
   - Document Redis setup requirements
   - Add troubleshooting guide
   - Add monitoring queries

**Deliverables**:
- [ ] Fixed `src/lib/rate-limit.ts`
- [ ] Tests in `src/lib/__tests__/rate-limit.test.ts`
- [ ] Documentation in `docs/REDIS_SETUP.md`
- [ ] Connection health check endpoint

---

### **Task 1.3: UptimeRobot Setup** 📡 HIGH PRIORITY
**Duration**: 1 hour work → 5 mins for you

**Actions**:
1. **Research alternatives** (since you can't access UptimeRobot directly):
   - Better Stack (betterstack.com)
   - StatusCake
   - Pingdom
   - Self-hosted: Uptime Kuma

2. **Create setup guide**:
   - Step-by-step for user to configure
   - What to monitor:
     - Main site: https://apexrebate.com
     - API health: https://apexrebate.com/api/health
     - Supabase connection
   - Alert channels: Email, Telegram, Slack
   - Check frequency: 1 minute
   - Alert threshold: 2 failures

3. **Create health check endpoint** (if not exists):
   - `src/app/api/health/route.ts`
   - Check: Database, Redis, APIs
   - Return: Status + metrics

**Deliverables**:
- [ ] `docs/UPTIME_MONITORING_GUIDE.md` - Setup instructions
- [ ] Enhanced `src/app/api/health/route.ts` - Comprehensive health check
- [ ] Alert templates (email, Telegram)

---

### **Task 1.4: RLS Policies - Design & Implementation** 🔐 CRITICAL
**Duration**: 4 hours work → 20 mins for you

**Actions**:
1. **Design RLS policies** for viral tables:
   ```sql
   -- user_tiers: Users can only see their own tier
   -- referral_network: Users see own referrals + their referrers
   -- commission_pool: Read-only for all authenticated users
   -- commission_transactions: Users see only their own transactions
   -- viral_metrics: Admin only
   ```

2. **Implementation**:
   - Create `supabase/migrations/20251127_rls_policies.sql`
   - Enable RLS on all 5 tables
   - Create policies for:
     - SELECT (read)
     - INSERT (write - where applicable)
     - UPDATE (update - where applicable)
     - DELETE (delete - admin only)
   - Special policies for admin role

3. **Testing**:
   - Test as regular user (can only see own data)
   - Test as different user (cannot see others' data)
   - Test as admin (can see all data)
   - Verify no data leaks

4. **Documentation**:
   - Explain each policy
   - Security rationale
   - Testing checklist

**Deliverables**:
- [ ] `supabase/migrations/20251127_rls_policies.sql` - RLS policies
- [ ] Test queries to verify policies
- [ ] `docs/RLS_POLICIES.md` - Documentation
- [ ] Security audit report

---

### **Task 1.5: Seed Test Data - Real Implementation** 🌱 MEDIUM
**Duration**: 1 hour work → 5 mins for you

**Actions**:
1. **Check existing users**:
   - Query `auth.users` table
   - Get 3-5 real user IDs (if exist)
   - If no users, document how to create test users

2. **Update seed script**:
   - Replace placeholder UUIDs in `scripts/seed-viral-economics.sql`
   - Use real user IDs from auth.users
   - Create realistic test data:
     - User 1: FREE tier, 0 referrals
     - User 2: BASIC tier, 5 referrals, $10k volume
     - User 3: TRADER tier, 20 referrals, $50k volume
     - User 4: PRO tier, 50 referrals, $200k volume
     - Referral chains: User 1 → User 2 → User 3 → User 4

3. **Execute & verify**:
   - Run seed script
   - Query to verify data inserted
   - Test API endpoints with seeded data
   - Verify tier calculations work

**Deliverables**:
- [ ] Updated `scripts/seed-viral-economics.sql` with real UUIDs
- [ ] `scripts/create-test-users.sql` - Create test users if needed
- [ ] Verification queries
- [ ] Sample API responses with test data

---

## 📋 **PART 2: WEEK 2 "BRAIN BUILD" - ARCHITECTURE & FOUNDATION**

### **Task 2.1: Binance API Integration - Architecture & Skeleton** 🧠 HIGH
**Duration**: 6 hours work → 30 mins for you

**Actions**:
1. **Architecture design**:
   - Design data pipeline: Binance API → Database → ML Model
   - Schema for OHLCV data:
     - Table: `market_data_ohlcv`
     - Fields: symbol, timeframe, open, high, low, close, volume, timestamp
   - Real-time vs historical data strategy
   - Rate limiting strategy (Binance limits)

2. **Code skeleton**:
   - Create `src/lib/trading/binance-client.ts` - API wrapper
   - Create `src/lib/trading/data-pipeline.ts` - ETL logic
   - Create `backend/agents/data_agent.py` - Python data collector
   - Create cron job spec for data collection

3. **Database migration**:
   - Create `supabase/migrations/20251127_market_data.sql`
   - Tables: market_data_ohlcv, trading_signals, opportunities
   - Indexes for performance

4. **Environment setup**:
   - Document Binance API key requirements
   - Create `.env.example` with BINANCE_API_KEY, BINANCE_SECRET
   - Add validation for API credentials

**Deliverables**:
- [ ] `docs/DATA_PIPELINE_ARCHITECTURE.md` - Architecture document
- [ ] `src/lib/trading/binance-client.ts` - Binance API client
- [ ] `src/lib/trading/data-pipeline.ts` - Data pipeline
- [ ] `backend/agents/data_agent.py` - Python data collector
- [ ] `supabase/migrations/20251127_market_data.sql` - Market data schema
- [ ] `docs/BINANCE_API_SETUP.md` - Setup guide

---

### **Task 2.2: Paper Trading Mode - Foundation** 💰 HIGH
**Duration**: 8 hours work → 40 mins for you

**Actions**:
1. **Design paper trading system**:
   - Virtual wallet (separate from real wallet)
   - Order execution simulation
   - P&L tracking
   - Performance metrics

2. **Database schema**:
   - Create migration: `20251127_paper_trading.sql`
   - Tables:
     - `paper_wallets` - Virtual balances
     - `paper_trades` - Simulated trades
     - `paper_pnl` - P&L tracking
     - `paper_strategies` - Strategy configs

3. **Core logic**:
   - Create `src/lib/trading/paper-trading.ts`
   - Functions:
     - `createPaperWallet()` - Initialize virtual wallet
     - `executePaperTrade()` - Simulate trade execution
     - `calculatePaperPnL()` - Calculate P&L
     - `getPaperPerformance()` - Get metrics

4. **API routes**:
   - `POST /api/v1/trading/paper/execute` - Execute paper trade
   - `GET /api/v1/trading/paper/portfolio` - Get paper portfolio
   - `GET /api/v1/trading/paper/history` - Get trade history
   - `GET /api/v1/trading/paper/pnl` - Get P&L

5. **Testing**:
   - Unit tests for paper trading logic
   - Integration tests with mock market data
   - Verify no real money at risk

**Deliverables**:
- [ ] `supabase/migrations/20251127_paper_trading.sql` - Schema
- [ ] `src/lib/trading/paper-trading.ts` - Core logic
- [ ] API routes in `src/app/api/v1/trading/paper/`
- [ ] Tests in `src/__tests__/trading/paper-trading.test.ts`
- [ ] `docs/PAPER_TRADING.md` - User guide

---

### **Task 2.3: ML Model "Opportunity Detector" - Architecture** 🤖 MEDIUM
**Duration**: 4 hours work → 20 mins for you

**Actions**:
1. **Research & design**:
   - What signals to detect:
     - Arbitrage opportunities (cross-exchange)
     - Trend reversals
     - Volume anomalies
     - Whale movements
   - Features needed:
     - Price data (OHLCV)
     - Volume data
     - Order book depth
     - Social sentiment (optional)

2. **Model architecture**:
   - Approach: Rule-based + ML hybrid
   - Phase 1: Simple rule-based (threshold-based)
   - Phase 2: ML classification (Random Forest, XGBoost)
   - Phase 3: Deep learning (LSTM for time series)

3. **Code skeleton**:
   - Create `backend/ml/opportunity_detector.py`
   - Create `backend/ml/feature_engineering.py`
   - Create `backend/ml/training_pipeline.py`

4. **Data requirements**:
   - Minimum data needed: 30 days OHLCV
   - Labels: manual labeling + backtesting results
   - Training/validation/test split: 70/15/15

**Deliverables**:
- [ ] `docs/ML_OPPORTUNITY_DETECTOR.md` - Architecture doc
- [ ] `backend/ml/opportunity_detector.py` - Model skeleton
- [ ] `backend/ml/feature_engineering.py` - Feature logic
- [ ] `backend/ml/requirements.txt` - Python dependencies
- [ ] Sample training notebook: `notebooks/train_opportunity_detector.ipynb`

---

### **Task 2.4: Content Engine - "Death of Manual Trading" Blog** ✍️ MEDIUM
**Duration**: 2 hours work → 10 mins for you

**Actions**:
1. **Research**:
   - Analyze top trading blogs for SEO
   - Identify keywords: "automated trading", "AI trading", "crypto signals"
   - Check competitor content

2. **Write blog post**:
   - Title: "The Death of Manual Trading: How AI Agents Are Revolutionizing Crypto"
   - Length: 2000-2500 words
   - Structure:
     - Hook: Statistics on manual trader losses
     - Problem: Why manual trading fails (emotion, speed, data overload)
     - Solution: AI-powered trading
     - How it works: Explain Apex OS
     - Case studies: Example scenarios
     - CTA: Sign up for early access
   - SEO optimized: H2, H3, keywords, meta description
   - Internal links to product pages

3. **Format**:
   - Markdown format
   - Ready to publish on blog
   - Include images placeholders
   - Social media snippets

**Deliverables**:
- [ ] `content/blog/death-of-manual-trading.md` - Full blog post
- [ ] `content/blog/death-of-manual-trading-meta.json` - SEO metadata
- [ ] Social media snippets (Twitter, LinkedIn)
- [ ] Email newsletter version

---

### **Task 2.5: Payment Integration Prep** 💳 HIGH
**Duration**: 3 hours work → 15 mins for you

**Actions**:
1. **Research payment providers**:
   - **Polar.sh**: For SaaS subscriptions
     - Pricing, features, documentation
     - Integration guide
     - Webhook setup
   - **Binance Pay**: For crypto payments
     - Merchant requirements
     - API documentation
     - Webhook setup

2. **Create integration guides**:
   - Step-by-step setup for user (Anh) to follow
   - What info needed (Business registration, API keys, etc.)
   - How to test in sandbox mode
   - Production deployment checklist

3. **Code preparation**:
   - Review existing payment code:
     - `src/app/api/webhooks/polar/route.ts`
     - `src/app/api/webhooks/binance-pay/route.ts`
   - Identify what's missing
   - Create TODO list for implementation

4. **Environment variables**:
   - Document all required env vars
   - Create `.env.payment.example`
   - Add validation logic

**Deliverables**:
- [ ] `docs/POLAR_INTEGRATION_GUIDE.md` - Complete setup guide
- [ ] `docs/BINANCE_PAY_INTEGRATION_GUIDE.md` - Complete setup guide
- [ ] `.env.payment.example` - Example env vars
- [ ] `docs/PAYMENT_TESTING_CHECKLIST.md` - Testing guide
- [ ] Updated webhook handlers (if needed)

---

## 📋 **PART 3: CODE QUALITY & TESTING** 

### **Task 3.1: Test Coverage Analysis** 🧪 MEDIUM
**Duration**: 2 hours work → 10 mins for you

**Actions**:
1. **Run coverage report**:
   ```bash
   npm test -- --coverage
   ```

2. **Analyze results**:
   - Current coverage: ~48% (from previous audit)
   - Identify uncovered critical paths:
     - Viral economics logic
     - Payment webhooks
     - Trading logic
     - Admin functions

3. **Create test plan**:
   - Priority 1: Critical paths (payment, trading, auth)
   - Priority 2: Business logic (tiers, commissions, referrals)
   - Priority 3: UI components

4. **Write missing tests**:
   - Focus on P0 and P1 areas
   - Aim for 70%+ coverage
   - Create test fixtures and mocks

**Deliverables**:
- [ ] Coverage report saved to `docs/TEST_COVERAGE_REPORT.md`
- [ ] New tests written (aim for +10-15% coverage)
- [ ] Test plan document: `docs/TEST_ROADMAP.md`
- [ ] Coverage target: 70%+

---

### **Task 3.2: TypeScript Strict Mode Audit** 📐 LOW
**Duration**: 1 hour work → 5 mins for you

**Actions**:
1. **Check current config**:
   - Review `tsconfig.json`
   - Check if strict mode enabled
   - Identify any `any` types

2. **Run strict check**:
   ```bash
   npx tsc --noEmit --strict
   ```

3. **Fix critical issues**:
   - Replace `any` with proper types
   - Add missing type definitions
   - Fix type errors

4. **Document**:
   - List remaining type issues
   - Create plan to fix over time

**Deliverables**:
- [ ] TypeScript audit report: `docs/TYPESCRIPT_AUDIT.md`
- [ ] Fixed critical type errors
- [ ] Updated `tsconfig.json` if needed

---

## 📋 **PART 4: DOCUMENTATION & REPORTING**

### **Task 4.1: Update Master Progress Tracker** 📊 HIGH
**Duration**: 30 mins → 5 mins for you

**Actions**:
1. Update `MASTER_PROGRESS_TRACKER.md`:
   - Mark Week 1 tasks as complete
   - Update progress percentages
   - Add Week 2 tasks
   - Update overall % completion

2. Create session report:
   - What was completed
   - What was auto-fixed
   - Test results
   - Next priorities

**Deliverables**:
- [ ] Updated `MASTER_PROGRESS_TRACKER.md`
- [ ] `SESSION_REPORT_2025-11-27_PART2.md` - This session's work

---

### **Task 4.2: Create Architecture Diagrams** 🎨 MEDIUM
**Duration**: 2 hours → 10 mins for you

**Actions**:
1. **Create Mermaid diagrams**:
   - System architecture overview
   - Data pipeline flow (Binance → Database → ML → Trading)
   - User journey (Signup → Tier → Referral → Commission)
   - Payment flow (User → Polar/Binance → Webhook → Database)
   - Agent architecture (DevAgent, DataAgent, MarketAgent, etc.)

2. **Save as markdown**:
   - `docs/diagrams/SYSTEM_ARCHITECTURE.md`
   - `docs/diagrams/DATA_PIPELINE.md`
   - `docs/diagrams/USER_JOURNEY.md`
   - `docs/diagrams/PAYMENT_FLOW.md`
   - `docs/diagrams/AGENT_ARCHITECTURE.md`

**Deliverables**:
- [ ] 5 architecture diagrams in Mermaid format
- [ ] Index page: `docs/diagrams/README.md`

---

## 📋 **PART 5: SECURITY & COMPLIANCE**

### **Task 5.1: Security Audit** 🔒 HIGH
**Duration**: 3 hours → 15 mins for you

**Actions**:
1. **Audit checklist**:
   - [ ] All API routes have auth checks
   - [ ] No sensitive data in logs
   - [ ] Environment variables secured
   - [ ] Rate limiting on all public endpoints
   - [ ] Input validation on all user inputs
   - [ ] SQL injection prevention (using Supabase ORM)
   - [ ] XSS prevention (React default + CSP)
   - [ ] CSRF protection
   - [ ] Secure cookies (httpOnly, secure, sameSite)
   - [ ] Password hashing (Supabase handles)
   - [ ] API keys encrypted at rest

2. **Run security scan**:
   ```bash
   npm audit
   npm audit fix
   ```

3. **Fix issues**:
   - Address critical and high vulnerabilities
   - Update dependencies
   - Document wont-fix items with rationale

**Deliverables**:
- [ ] `docs/SECURITY_AUDIT_REPORT.md` - Audit results
- [ ] Fixed security issues
- [ ] Updated dependencies
- [ ] Security checklist: `docs/SECURITY_CHECKLIST.md`

---

## 🎯 **SUCCESS CRITERIA**

### **Must Complete (P0)**:
- [x] All Week 1 tasks implemented & tested
- [x] Sentry monitoring working
- [x] Redis rate limiter fixed
- [x] RLS policies deployed
- [x] Test coverage >70%
- [x] Zero critical security issues
- [x] All tests passing (>113 tests)
- [x] Documentation complete

### **Should Complete (P1)**:
- [x] Binance API skeleton ready
- [x] Paper trading foundation built
- [x] ML architecture designed
- [x] Payment integration guides created
- [x] Blog post written

### **Nice to Have (P2)**:
- [x] Architecture diagrams
- [x] TypeScript strict mode audit
- [x] Content snippets for social media

---

## 📊 **EXPECTED RESULTS**

After completion:
- **Week 1 Progress**: 30% → 100% ✅
- **Week 2 Progress**: 0% → 40% ✅
- **Overall Master Plan**: 22% → 35% (+13%)
- **Test Coverage**: 48% → 70%+
- **Security Score**: Unknown → A+ (audited)
- **Tech Debt**: 0 → 0 (maintained)

---

## 💻 **EXECUTION PROTOCOL**

### **How to Execute**:
1. **Work sequentially** through Parts 1-5
2. **Prioritize** P0 tasks first
3. **Auto-implement** wherever possible (don't just document)
4. **Test everything** you implement
5. **Document** as you go
6. **Commit** after each major section
7. **Report** progress incrementally

### **Git Commit Strategy**:
- Commit after each Part (1-5)
- Clear commit messages with scope
- Example: `feat(monitoring): implement Sentry full setup`

### **Quality Standards**:
- All code must pass TypeScript checks
- All new code must have tests
- All tests must pass (100%)
- All docs must be complete
- Zero technical debt

---

## 🚀 **DELIVERABLES SUMMARY**

### **Code Files** (~25 files):
1. `sentry.client.config.ts` - Sentry client config
2. `sentry.server.config.ts` - Sentry server config  
3. Updated `src/lib/monitoring/sentry.ts` - Real implementation
4. Updated `src/lib/rate-limit.ts` - Fixed Redis logic
5. Enhanced `src/app/api/health/route.ts` - Health checks
6. `supabase/migrations/20251127_rls_policies.sql` - RLS policies
7. `supabase/migrations/20251127_market_data.sql` - Market data schema
8. `supabase/migrations/20251127_paper_trading.sql` - Paper trading schema
9. `src/lib/trading/binance-client.ts` - Binance API client
10. `src/lib/trading/data-pipeline.ts` - Data pipeline
11. `src/lib/trading/paper-trading.ts` - Paper trading core
12. `backend/agents/data_agent.py` - Python data collector
13. `backend/ml/opportunity_detector.py` - ML model skeleton
14. API routes for paper trading (4 files)
15. Tests (10+ new test files)

### **Documentation** (~20 files):
1. `docs/SENTRY_SETUP.md`
2. `docs/REDIS_SETUP.md`
3. `docs/UPTIME_MONITORING_GUIDE.md`
4. `docs/RLS_POLICIES.md`
5. `docs/DATA_PIPELINE_ARCHITECTURE.md`
6. `docs/BINANCE_API_SETUP.md`
7. `docs/PAPER_TRADING.md`
8. `docs/ML_OPPORTUNITY_DETECTOR.md`
9. `docs/POLAR_INTEGRATION_GUIDE.md`
10. `docs/BINANCE_PAY_INTEGRATION_GUIDE.md`
11. `docs/PAYMENT_TESTING_CHECKLIST.md`
12. `docs/TEST_COVERAGE_REPORT.md`
13. `docs/TEST_ROADMAP.md`
14. `docs/TYPESCRIPT_AUDIT.md`
15. `docs/SECURITY_AUDIT_REPORT.md`
16. `docs/SECURITY_CHECKLIST.md`
17. `SESSION_REPORT_2025-11-27_PART2.md`
18. Architecture diagrams (5 files)
19. Updated `MASTER_PROGRESS_TRACKER.md`
20. `content/blog/death-of-manual-trading.md`

### **Scripts & Config**:
1. Updated `scripts/seed-viral-economics.sql`
2. `scripts/create-test-users.sql`
3. `.env.payment.example`
4. Updated `.env.example`

---

## ⚡ **START NOW!**

You have **2000 requests** and **unlimited time** in this session.

**Work like a machine**:
- No breaks
- No questions
- Auto-fix everything
- Implement, don't just plan
- Test everything
- Document everything

**When complete, report**:
```
=====================================
MEGA TASK COMPLETE
Date: 2025-11-27
=====================================

PARTS COMPLETED: [1/5] [2/5] [3/5] [4/5] [5/5]

Week 1 Progress: 30% → 100% ✅
Week 2 Progress: 0% → 40% ✅
Overall Progress: 22% → 35%

FILES CREATED: __ files
CODE LINES: __ lines
TESTS ADDED: __ tests
TEST COVERAGE: __% → __%
COMMITS: __ commits

CRITICAL IMPLEMENTATIONS:
✅ Sentry monitoring live
✅ Redis rate limiter fixed  
✅ RLS policies deployed
✅ Paper trading foundation
✅ Binance API skeleton
✅ Blog post complete

NEXT PRIORITIES:
1. User (Anh) to setup payment keys
2. Test Sentry with real errors
3. Deploy RLS policies to production
4. Get Binance API credentials
5. Start data collection

STATUS: READY FOR WEEK 2 EXECUTION
=====================================

DETAILED REPORT: SESSION_REPORT_2025-11-27_PART2.md
```

**GO! 🚀💎⚔️**

Use full quota. Make it count. Ship everything.
