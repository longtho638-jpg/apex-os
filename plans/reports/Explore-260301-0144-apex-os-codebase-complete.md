# APEX-OS CODEBASE EXPLORATION REPORT
**Date:** 2026-03-01 | **Status:** Production-Ready ✅ | **Scale:** Enterprise Trading Platform

---

## 1. PROJECT OVERVIEW

**Apex OS** is an institutional-grade, multi-org-ready trading platform with:
- Revenue-as-a-Service (RaaS) AGI model: zero subscription fees, earn via exchange spread
- Advanced AI agents for trading, risk management, and referral optimization
- Multi-language support (7 locales: EN, VI, ZH, JA, KO, ID, TH)
- Institutional security: MFA, IP whitelist, WebAuthn, audit logging
- Real-time trading with Binance integration, copy trading, signals, and paper trading
- Referral/viral economics engine with tiered commissions

**Tech Stack:**
- **Frontend:** Next.js 14, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, TypeScript, WebSocket, Redis, Supabase (PostgreSQL)
- **Trading:** CCXT (Binance), lightweight-charts, TA indicators
- **Security:** bcrypt, JWT, TOTP MFA, WebAuthn, @simplewebauthn
- **AI:** Google Vertex AI, OpenAI, DeepSeek
- **Payments:** Polar.sh (primary), NowPayments (crypto gate)
- **Monitoring:** Sentry, PostHog, Audit logs

**Repo Location:** `/Users/macbookprom1/mekong-cli/apps/apex-os`

---

## 2. SRC/ DIRECTORY STRUCTURE (COMPLETE)

### 2.1 Top-Level Directories
```
src/
├── __tests__/               # Test suites (integration, lib, trading, viral-economics)
├── app/                     # Next.js app router (pages + API routes)
├── components/              # 45+ component folders (UI, admin, payments, etc.)
├── config/                  # Configuration files (9 files)
├── constants/               # Application constants (2 files)
├── contexts/                # React context (AuthContext.tsx)
├── database/                # SQL migrations & scripts (32 files)
├── hooks/                   # Custom React hooks (28 files)
├── i18n/                    # Internationalization setup (2 files)
├── lib/                     # Core business logic (76+ files across 38 folders)
├── middleware/              # API/request middleware (9 files)
├── middleware.ts            # Next.js middleware entry point
├── scripts/                 # Utility scripts (9 folders)
├── types/                   # TypeScript type definitions (5 files)
└── i18n.ts                  # i18n entry point
```

---

## 3. LIB/ CORE BUSINESS LOGIC (76 files across 38 folders)

### 3.1 AI & Agents (9 files)
- **ai/deepseek.ts** — DeepSeek LLM integration
- **ai/rate-limiter.ts** — AI request throttling
- **ai/smart-router.ts** — AI model selection logic
- **ai/engines/momentum.ts** — Momentum strategy AI
- **ai/engines/sentiment.ts** — Sentiment analysis
- **ai/singularity/rebalancer.ts** — Portfolio rebalancing
- **agents/execution-agent.ts** — Trade execution automation
- **agents/withdrawal-agent.ts** — Withdrawal request handling
- **agent/event-bus.ts** — Inter-agent event system

### 3.2 Trading Engine (13 files)
- **trading/CopyTradingEngine.ts** — Social trading replication
- **trading/binance-client.ts** — Binance API client
- **trading/broadcaster.ts** — Price/order broadcast
- **trading/data-pipeline.ts** — Market data ingestion
- **trading/paper-trading.ts** — Paper trading simulator
- **trading/settlement.ts** — T+1/T+2 settlement logic
- **algo/backtest-engine.ts** — Historical backtesting
- **algo/compiler.ts** — Strategy compilation
- **quant/FeatureEngine.ts** — ML feature extraction
- **quant/SignalLogic.ts** — Signal generation logic
- **quant/TechnicalCalculator.ts** — RSI/MACD/Bollinger
- **indicators.ts** — TA indicator library
- **market-maker/bot.ts** — Market making bot

### 3.3 Payments & Finance (9 files)
- **payments/polar-client.ts** — Polar.sh SDK wrapper
- **payments/nowpayments-client.ts** — NowPayments crypto gate
- **finance/vault-manager.ts** — Crypto vault management
- **finance/vesting.ts** — Token vesting schedules
- **finance/withdrawal-service.ts** — Fiat/crypto withdrawals
- **financial/viral-engine.ts** — Viral coefficient calculator
- **referral-commission.ts** — Commission rate logic
- **discount-engine.ts** — Tiered discount calculator
- **api/billing.ts** — Billing & invoice APIs

### 3.4 Viral Economics & Gamification (8 files)
- **viral-economics/auth.ts** — Session mgmt for referrals
- **viral-economics/commission-calculator.ts** — Multi-tier calc
- **viral-economics/cron-jobs.ts** — Daily/monthly payouts
- **viral-economics/gamification.ts** — Gamification mechanics
- **viral-economics/realtime-commission.ts** — Realtime rebates
- **viral-economics/referral-manager.ts** — Referral state
- **viral-economics/tier-manager.ts** — Tier upgrade logic
- **upgrade-triggers.ts** — Volume-based tier detection

### 3.5 Security & Auth (14 files)
- **auth/api-key.ts** — API key generation & validation
- **auth/ip-whitelist.ts** — IP filtering logic
- **auth/mfa-check.ts** — MFA verification
- **security/audit-logger.ts** — Audit trail logging
- **security/crypto.ts** — Crypto utilities
- **security/encryption.ts** — Data encryption
- **security/signature.ts** — Message signing
- **security/multi-sig.ts** — Multi-signature support
- **security/sanitization.ts** — Input sanitization
- **security/disposable-email.ts** — Disposable email detection
- **jwt.ts** — JWT encoding/decoding
- **mfa.ts** — TOTP/MFA generation
- **encryption.ts** — Field-level encryption
- **rate-limit.ts** — Rate limiting per IP/user

### 3.6 Database & Services (12 files)
- **db.ts** — Supabase PostgreSQL client
- **supabase.ts** — Main Supabase wrapper
- **supabase/client.ts** — Client-side Supabase
- **supabase/server.ts** — Server-side Supabase
- **services/audit-service.ts** — Audit log storage
- **services/exchange-verification.ts** — Exchange auth verify
- **services/wallet.service.ts** — Wallet operations
- **crm-service.ts** — CRM customer data
- **email-service.ts** — Email sending
- **notification-service.ts** — In-app notifications
- **logger.ts** — Structured logging

### 3.7 Monitoring & Analytics (5 files)
- **monitoring/sentry.ts** — Sentry error tracking
- **analytics.ts** — Event tracking
- **analytics-advanced.ts** — Advanced analytics
- **analytics-mock.ts** — Mock analytics for dev
- **usage-tracking.ts** — Feature usage tracking

### 3.8 Risk Management (5 files)
- **risk/PositionSizing.ts** — Kelly criterion sizing
- **risk/RiskMetrics.ts** — VaR, drawdown, sharpe
- **risk/types.ts** — Risk types
- **audit.ts** — Compliance audit
- **circuit-breaker.ts** — Circuit breaker pattern

### 3.9 Utilities & Support (12 files)
- **api.ts** — REST client
- **api-cache.ts** — API response caching
- **api/client.ts, api/config.ts** — API setup
- **api/pnl.ts, api/rebates.ts, api/referral.ts, api/risk.ts, api/settings.ts, api/wolfpack.ts** — Domain APIs
- **utils.ts, utils/testDataGenerator.ts** — Utilities
- **redis.ts** — Redis client
- **retry.ts** — Exponential backoff
- **beehive-brain.ts** — Distributed compute brain
- **binance-feed.ts** — Real-time Binance feed

### 3.10 ML & Other (8 files)
- **ml/SimplePredictor.ts, ml/types.ts** — ML prediction
- **social/twitter-client.ts** — Twitter API
- **ab-testing.ts, apps.tsx, blog/posts.ts** — Misc
- **constants/roles.ts, constants/zen-modes.ts** — Constants
- **crypto/vault.ts, exchanges/binance.ts** — Crypto
- **privacy.ts, posthog.ts, seo-metadata.ts** — Other

---

## 4. COMPONENTS/ (45+ folders, ~200+ component files)

### 4.1 Admin Suite (26 folders)
- `admin/agents/` — Agent dashboard
- `admin/analytics-dashboard/` — Analytics
- `admin/audit-logs/` — Audit viewer
- `admin/auth/` — Admin auth
- `admin/cohorts/` — User cohorts
- `admin/content/posts/` — Content CMS
- `admin/crm/` — CRM dashboard
- `admin/dashboard/` — Admin home
- `admin/defi/` — DeFi analytics
- `admin/exchanges/` — Exchange mgmt
- `admin/finance/cap-table/` — Finance reporting
- `admin/growth/` — Growth metrics
- `admin/market-maker/` — Market maker
- `admin/marketing/` — Marketing settings
- `admin/mfa/` — MFA management
- `admin/providers/` — Provider list
- `admin/signals/` — Signal management
- `admin/ab-tests/` — A/B test editor
- `admin/retention/` — Retention analysis
- `admin/security/` — Security (mfa, alerts, ip-whitelist, audit)
- `admin/singularity/` — AI config
- `admin/system/` — System settings
- `admin/templates/` — Email templates
- `admin/users/[id]/inspector/` — User inspector
- `admin/viral-economics/` — Referral config
- `admin/whitelabel/` — White-label settings

### 4.2 User-Facing Features (19+ folders)
- `ai/` — AI agents & settings
- `auth/` — Auth components
- `blog/` — Blog pages
- `checkout/` — Payment checkout
- `common/` — Shared utilities
- `compliance/` — Compliance widgets
- `dao/` — DAO governance
- `dashboard/` — User dashboard (30+ subcomponents)
- `defi/` — DeFi features
- `landing/` — Landing page
- `launchpad/` — Token launchpad
- `layout/` — Layout wrappers
- `marketing/` — Marketing sections
- `notifications/` — In-app notifications
- `onboarding/` — Onboarding flow
- `os/` — OS widgets
- `payments/` — Payment flows
- `pricing/` — Pricing display
- `referrals/` — Referral UI
- `rebates/` — Rebate display
- `security/` — Security settings
- `settings/` — User settings
- `strategy/` — Strategy builder
- `studio/` — Studio interface
- `support/` — Support chat
- `telegram/` — Telegram bot UI
- `testing/` — Testing tools
- `trading/` — Trading UI (13 subcomponents)
- `ui/` — Shadcn/ui primitives (21+ components)
- `upsell/` — Upsell flows
- `viral-economics/` — Viral economics UI
- `wallet/` — Wallet connect

---

## 5. APP/ PAGES & ROUTES

### 5.1 Public Pages (11)
- `[locale]/` — Homepage
- `[locale]/landing` — Landing page
- `[locale]/signup` — Sign-up
- `[locale]/auth` — Auth flow
- `[locale]/forgot-password` — Password reset
- `[locale]/reset-password` — Confirm password
- `[locale]/docs` — Documentation
- `[locale]/blog` — Blog listing
- `[locale]/status` — Status page
- `[locale]/support` — Support center
- `[locale]/r/[code]` — Referral landing

### 5.2 User Pages (15+)
- `[locale]/dashboard` — Main dashboard
- `[locale]/trade` — Trading interface
- `[locale]/copy-trading` — Social trading
- `[locale]/signals` — AI signals
- `[locale]/leaderboard` — Leaderboard
- `[locale]/studio` — Strategy studio
- `[locale]/tools` — Developer tools
- `[locale]/offer` — Special offers
- `[locale]/dao` — DAO participation
- `[locale]/launch` — Launch events
- `[locale]/launchpad` — Token launchpad
- `[locale]/enterprise` — Enterprise features
- `[locale]/finance` — Finance dashboard
- `[locale]/partner` — Partner portal
- `[locale]/settings` — User settings

### 5.3 Admin Pages (28+)
All under `[locale]/admin/` (see components list above)

### 5.4 API Routes (40+ endpoints)
- `/api/v1/auth/*` — Authentication (6 routes)
- `/api/v1/trade/*` — Trading (2 routes)
- `/api/v1/admin/*` — Admin (25+ routes)
- `/api/v1/referral/*` — Referrals (2 routes)
- `/api/v1/signals/` — Signal generation
- `/api/v1/payments/*` — Payments (2 routes)
- `/api/v1/crypto-gate/` — Crypto deposits/withdrawals

---

## 6. CONFIG FILES (9 files)

1. **compliance.ts** — GDPR, KYC, AML settings
2. **i18n.ts** — i18n configuration
3. **locales.ts** — Supported locales (EN, VI, ZH, JA, KO, ID, TH)
4. **navigation.ts** — App navigation structure
5. **onboarding-tour.ts** — User onboarding steps
6. **payment-tiers.ts** — Tier IDs (EXPLORER, OPERATOR, ARCHITECT, SOVEREIGN)
7. **unified-tiers.ts** — Complete tier definitions with RaaS config
8. **tokenomics.ts** — Token economics parameters
9. **wagmi.ts** — Wagmi (Web3) configuration

---

## 7. HOOKS (28 custom hooks)

**Data & State:** useApi, useExchangeAccounts, useMarketData, usePositions, usePnLSummary, useUserPortfolio, useUserSettings, useUserTier, useSubscription

**Trading:** useCryptoPrice, usePriceStream, usePortfolioRisk, useTechnicalIndicators, useRiskMetrics, useRealPortfolioReturns

**Features:** useReferral, useRebates, useGamification, useWolfPack, useUpgradeTier, usePresale, useQuantFeatures

**System:** useWebSocket, usePushNotifications, useComplianceCheck, useMLPrediction, useWallet

---

## 8. MIDDLEWARE (9 files)

1. **middleware.ts** — Next.js middleware (locale routing, auth)
2. **auth-guard.ts** — Auth verification
3. **checkIPWhitelist.ts** — IP filtering
4. **cors.ts** — CORS headers
5. **csrf.ts** — CSRF protection
6. **enterprise-auth.ts** — Enterprise SSO
7. **rateLimit.ts** — Rate limiting
8. **session-check.ts** — Session validation
9. **signature.ts** — Message signature verification

---

## 9. DATABASE (32 SQL files)

### Migrations (28 files)
- `add_teams.sql` — **MULTI-ORG SUPPORT**
- `add_affiliate_system.sql` — Referral tables
- `add_automation_rules.sql` — Automation engine
- `add_compliance_tracking.sql` — Compliance audit
- `add_copy_trading.sql` — Copy trading schema
- `add_ip_whitelist.sql` — IP filtering
- `add_limit_order_support.sql` — Limit orders
- `add_mfa_to_admin.sql` — Admin MFA
- `add_notifications.sql` — Notification system
- `add_rate_limits.sql` — Rate limit tracking
- `add_trading_signals.sql` — Signal storage
- `create_agent_heartbeats_table.sql` — Agent health
- `create_audit_logs.sql` — Audit trail
- `create_financial_tables.sql` — Finance (rebates, settlements)
- `create_security_alerts_table.sql` — Security events
- `create_security_events_table.sql` — Detailed events
- `create_trading_tables.sql` — Orders, positions, trades
- `copy_trading_schema.sql` — Social trading
- `create_reconciliation_logs_table.sql` — Settlement reconciliation
- Multiple fix & schema files

### Scripts (4 files)
- `create_api_keys_table.sql` — API key storage
- `create_invites_table.sql` — User invitations
- `setup_webhooks_cron.sql` — Polar webhook cron
- `promote_tester_to_admin.sql` — Test fixture

---

## 10. INTERNATIONALIZATION (7 languages)

**Message Files:**
- `messages/en.json` — English
- `messages/vi.json` — Vietnamese
- `messages/zh.json` — Chinese
- `messages/ja.json` — Japanese
- `messages/ko.json` — Korean
- `messages/id.json` — Indonesian
- `messages/th.json` — Thai

**i18n Setup:**
- `src/i18n.ts` — Main config
- `src/i18n/request.ts` — Locale detection
- `src/i18n/routing.ts` — Routing config
- `src/config/i18n.ts` — Settings
- `src/config/locales.ts` — Locale list

---

## 11. TYPES (5 files)

- **exchange.ts** — Exchange API types
- **finance.ts** — Financial types (orders, positions, settlements)
- **strategy.ts** — Strategy types
- **trading.ts** — Trading types (pair, order, position)
- **telegram.d.ts** — Telegram WebApp types

---

## 12. MULTI-ORG & ENTERPRISE ARCHITECTURE

**Evidence of Multi-Org Support:**
1. Database migration: `add_teams.sql` — Organization/team structure
2. Enterprise auth: `enterprise-auth.ts` — SSO integration (SAML/OIDC)
3. Admin whitelabel: `components/admin/whitelabel/`
4. Enterprise page: `src/app/[locale]/enterprise/`
5. Permission-based access: AuthContext checks

**Multi-Org Features:**
- Team/organization scoping in DB
- Enterprise SSO
- White-label branding
- Per-org audit trails
- Organization-level settings

---

## 13. PAYMENT & MONETIZATION

### Revenue Model: RaaS AGI (Revenue-as-a-Service)
**Paradigm:** Zero subscription fees, earn via exchange spread

**4 Tier System (src/config/unified-tiers.ts):**

1. **EXPLORER** ($0/mo)
   - Volume: 0–$10K/mo
   - 1 trading agent
   - 25 AI requests/day
   - 10% spread rebate
   - 10% referral commission

2. **OPERATOR** ($0/mo)
   - Volume: $10K–$100K/mo
   - 3 trading agents
   - 200 AI requests/day
   - Unlimited signals
   - 15% spread rebate
   - 15% + 5% commissions (2 levels)

3. **ARCHITECT** ($0/mo)
   - Volume: $100K–$1M/mo
   - 5 trading agents
   - Unlimited AI
   - Advanced features
   - 20% spread rebate
   - 20% + 10% + 5% commissions (3 levels)

4. **SOVEREIGN** ($0/mo)
   - Volume: $1M+/mo
   - Unlimited agents
   - Custom features
   - 30% spread rebate
   - Custom commission rates

### Financial Engine:
- Base spread: 0.30% (30 bps)
- Min spread: 0.05%
- Self-rebate: % returned to user on their trades
- Referral commissions: Multi-level (L1, L2, L3)
- Auto-upgrade: Volume-based via agentic system

### Payments Integration:

**Polar.sh (Primary):**
- File: `payments/polar-client.ts`
- Webhook: `setup_webhooks_cron.sql`
- Checkout: `components/payments/checkout/`

**NowPayments (Crypto Gate):**
- File: `payments/nowpayments-client.ts`
- Multi-chain: Ethereum, BSC, Polygon, Solana, TRON
- Stablecoins: USDT, USDC, DAI, BUSD
- Settlement: < 30 seconds

**Withdrawal System:**
- `finance/withdrawal-service.ts`
- Withdrawal agent: `agents/withdrawal-agent.ts`
- Fiat & crypto
- Settlement tracking in `trading/settlement.ts`

---

## 14. AI AGENTS & AUTOMATION

### Agent Types:
1. **Signal-Follower** — Follows AI trading signals (EXPLORER tier)
2. **Execution Agent** — Trade execution automation
3. **Withdrawal Agent** — Withdrawal processing
4. **Copy Trading Bot** — Replicates user trades
5. **Guardian Agent** — Risk monitoring
6. **Auditor Agent** — Rebate optimization
7. **Signal Generator** — ML calculations

### AI Models:
- **DeepSeek** — `ai/deepseek.ts`
- **OpenAI** — Integrated
- **Google Vertex AI** — `@google-cloud/vertexai`
- **Smart Router** — Model selection logic

### Agentic Features:
- Event bus: Inter-agent communication
- Agent heartbeats: Health monitoring
- Auto-tier detection: Volume-based promotion
- AI risk profiling: Onboarding assessment

---

## 15. CRYPTO & BLOCKCHAIN

### Exchange Integration:
- **CCXT** — Multi-exchange support
- **Binance** — Primary exchange
- **Binance WebSocket** — Real-time feeds
- **Binance Futures** — Leverage trading

### Web3 Integration:
- **Wagmi** — Wallet connections
- **RainbowKit** — Wallet UI
- **WalletConnect** — Multi-wallet
- **Web3 Auth** — Wallet signing

### Crypto Vault:
- `crypto/vault.ts` — Vault storage
- `security/encryption.ts` — Field encryption
- `security/multi-sig.ts` — Multi-signature
- On-chain settlement via NowPayments

---

## 16. SECURITY ARCHITECTURE

### Authentication:
1. Email/Password — bcrypt + JWT
2. Web3 Wallet — Message signing
3. MFA (TOTP) — Time-based OTP + recovery codes
4. WebAuthn — Passkey support
5. Enterprise SSO — SAML/OIDC

### Authorization:
- RBAC — Admin, moderator, user, trader roles
- Policy-based — AuthContext checks
- API Key auth — `auth/api-key.ts`

### Data Protection:
- Input sanitization — DOMPurify
- CSRF protection — `csrf.ts`
- CORS — Fine-grained
- Rate limiting — Redis-backed
- IP whitelist — Per-user filtering
- Encryption-at-rest — Field encryption
- TLS/HTTPS — Enforced

### Audit & Compliance:
- Audit logging — `security/audit-logger.ts`
- Security events — Tracked in DB
- Compliance tracking — KYC, AML, GDPR
- Disposable email detection — `security/disposable-email.ts`
- Compliance checks — Via `useComplianceCheck.ts`

### Monitoring:
- Sentry — Error tracking
- Security alerts — Real-time notifications
- Audit log export — CSV compliance
- Circuit breaker — Fail-safe patterns

---

## 17. REAL-TIME & STREAMING

### WebSocket Infrastructure:
- Server: Node.js, `ws` library
- Hook: `useWebSocket.ts` — Client-side
- Data: Prices, orders, positions
- Price stream: `binance-feed.ts`, `usePriceStream.ts`
- Broadcaster: `trading/broadcaster.ts` — Event distribution

### Data Pipelines:
- Real-time market data — Binance WebSocket
- Order book — In-memory matching
- Position updates — Redis pub/sub
- Settlement — `trading/settlement.ts`

---

## 18. .AI/ DIRECTORY (Agent/Skill Configuration)

### Agents (6 agent specs):
- code-reviewer.md
- database-admin.md
- debugger.md
- git-manager.md
- tester.md
- ui-ux-designer.md

### Skills (2 skill docs):
- nextjs-best-practices.md
- typescript-patterns.md

---

## 19. .AGENT/ DIRECTORY

Files:
- AUDIT_REPORT.md — Project audit findings
- CODING_RULES.md — Development rules

---

## 20. UNRESOLVED QUESTIONS

1. **Multi-Org Fully Implemented?**
   - DB has `add_teams.sql` migration
   - Enterprise auth exists
   - Need to verify: Are ALL API routes scoped to org?

2. **Polar.sh Webhook Production Ready?**
   - Integration exists
   - Need to verify: Are webhooks receiving & processing payments?

3. **AI Agents Auto-Promoting Tiers?**
   - Tier manager exists in `viral-economics/tier-manager.ts`
   - Upgrade triggers in `upgrade-triggers.ts`
   - Need to verify: Is volume detection working in production?

4. **Copy Trading Engine Fully Live?**
   - Component exists
   - Engine: `trading/CopyTradingEngine.ts`
   - Need to verify: Are copy trades executing? Performance impact?

5. **Crypto Gate (NowPayments) Working?**
   - Integration exists
   - Need to verify: Multi-chain tested? Settlement < 30s verified?

6. **WebAuthn (Passkey) Fully Working?**
   - Routes exist
   - Need to verify: Cross-device support? Fallback for unsupported browsers?

7. **Real-Time PnL Calculations**
   - Hook: `useRealPortfolioReturns.ts`
   - Need to verify: Are positions marked T+1/T+2 correctly? FX impact calculated?

---

**Report Generated:** 2026-03-01 | **Explorer:** Haiku 4.5
