# Project Overview & Product Development Requirements (PDR)

**Project Name**: Apex-OS
**Version**: 2.0.0
**Date**: 2026-03-01
**Model**: RaaS AGI (Revenue-as-a-Service, Agentic General Intelligence)

## 1. Executive Summary
Apex-OS is a **RaaS AGI agentic trading platform** — zero subscription fees, crypto-native, with AI agents that trade autonomously 24/7. It replaces the traditional SaaS subscription model with a volume-based revenue model where users pay zero monthly fees and the platform earns from exchange spread only. Users earn self-rebates and 4-level referral commissions.

## 2. Product Vision
To build the first **zero-fee, agentic trading OS** where AI agents handle trading, portfolio rebalancing, and risk management autonomously. Users earn from every trade in their network via viral economics. Tiers unlock automatically based on trading volume — no paywalls, no subscriptions.

### 2.1 RaaS vs SaaS
| Aspect | Old SaaS | RaaS AGI |
|--------|----------|----------|
| Monthly fee | $97–$997 | $0 |
| Revenue model | Subscriptions | Exchange spread (5–30 bps) |
| Tier unlock | Payment | Trading volume (auto) |
| Agent trading | Manual config | Autonomous 24/7 |
| Network effect | None | 4-level viral commission |

## 3. Functional Requirements

### 3.1 Trading Engine
- **Real-time Execution**: Sub-second latency for order placement and cancellation.
- **Strategy Support**: Support for Limit, Market, and Stop-Loss/Take-Profit orders.
- **Automation**: Configurable automation rules and AI-driven signal execution.
- **Multi-Exchange**: Architecture supports integration with major exchanges (Binance, Bybit, etc.).

### 3.2 User Interface
- **Dashboard**: Real-time portfolio overview, PnL tracking, and active orders.
- **Charts**: Interactive trading charts (TradingView integration or similar).
- **Responsiveness**: Fully responsive design for desktop and mobile web.

### 3.3 Security & User Management
- **Authentication**: Secure login via Supabase Auth (Email/Password, MFA).
- **Authorization**: Role-based access control (Admin, User, Trader).
- **Data Privacy**: Strict Row Level Security (RLS) on all user data.
- **Webhook Security**: Verified signatures for all external payment/subscription events (Polar.sh).

### 3.4 RaaS Economics
- **Zero-Fee Model**: $0/mo for all tiers, revenue from spread only.
- **Volume-Based Tiers**: Explorer ($0–$10K), Operator ($10K–$100K), Architect ($100K–$1M), Sovereign ($1M+).
- **Self-Rebate**: 10–50% cashback on spread per trade.
- **Viral Referrals**: 4-level commission tree (L1: 10–30%, L2: 5–15%, L3: 2–7%, L4: 1–3%).
- **Gamification**: Badges, streaks, tier progression, leaderboards.

### 3.5 Agentic Workflows
- **Agent Types**: signal-follower, dca-bot, grid-trader, arbitrage, copy-leader, market-maker, portfolio-rebalancer, custom-strategy.
- **Agent Slots**: Tier-gated (1 to unlimited).
- **Orchestrator**: Event bus wiring trades → commissions → tier checks → badge awards.
- **Singularity Rebalancer**: Auto-rebalances portfolio among top-performing agents.

### 3.6 Crypto Exchange
- **Zero-Fee Deposits**: USDT on 5+ chains.
- **DeFi Swap**: In-app token swap interface.
- **Multi-Exchange**: ccxt integration with 40+ exchanges (Binance primary).

## 4. Non-Functional Requirements
- **Performance**: Frontend First Contentful Paint (FCP) < 1.5s.
- **Scalability**: Backend designed to handle 10,000+ concurrent users via serverless/containerized scaling.
- **Reliability**: 99.9% Uptime target for trading services.
- **Security**: Zero critical vulnerabilities; compliance with standard security practices (OWASP).

## 5. Technical Constraints
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **Backend**: Python 3.9+ for trading logic, Supabase (PostgreSQL) for persistence.
- **Infrastructure**: Vercel (Frontend), VPS/Cloud (Trading Engine).

## 6. Success Metrics
- **System Stability**: 100% CI/CD pipeline pass rate.
- **Security**: 0 Critical/High vulnerabilities in production dependencies.
- **User Trust**: Successful processing of webhooks and payments without failure.
- **RaaS Adoption**: 80%+ users on volume-based tiers (no manual upgrade needed).
- **Agent Utilization**: Average 2+ active agents per user.
- **Viral Growth**: 30%+ users acquired via referral tree.
