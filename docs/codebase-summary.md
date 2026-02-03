# Codebase Summary

**Generated**: 2026-02-04
**Version**: 1.0.0

## 1. Project Overview
Apex-OS is a hybrid trading platform combining a Next.js 16 frontend with a Python-based algorithmic trading backend. It leverages Supabase for data persistence and authentication, with a focus on high-frequency trading capabilities and security.

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Testing**: Vitest, React Testing Library

### Backend & Data
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Trading Engine**: Python 3.9+
- **Crypto Library**: CCXT (implied)
- **Real-time**: Supabase Realtime / WebSockets

### Infrastructure
- **Hosting**: Vercel (Frontend) / VPS (Backend)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry (configured)

## 3. Key Directories

### `/src` (Frontend)
- `app/`: Next.js App Router structure.
- `components/`: Reusable React components (Atomic design).
- `lib/`: Utility functions, Supabase client, validators.
- `hooks/`: Custom React hooks.
- `types/`: TypeScript definitions.

### `/backend` (Trading Engine)
- `agents/`: Autonomous trading agents (Auditor, Collector, Guardian).
- `api/`: Python API routes.
- `core/`: Core trading logic and configurations.
- `engines/`: PnL calculators and execution engines.
- `integrations/`: Exchange clients.

### `/docs` (Documentation)
- Comprehensive project documentation including roadmaps, architecture, and standards.

## 4. Security Architecture
- **Row Level Security (RLS)**: Strictly enforced on all database tables.
- **Webhook Verification**: Polar.sh webhooks verified using raw body signatures.
- **Dependency Management**: Automated vulnerability scanning with strict overrides.
- **Environment Isolation**: Separate configs for Dev, Staging, and Production.

## 5. Recent Significant Changes
- **2026-02-04**: Completed comprehensive security audit.
    - Fixed webhook signature verification.
    - Reduced high/critical npm vulnerabilities to near zero.
    - Achieved 100% test pass rate (122/122 tests).
