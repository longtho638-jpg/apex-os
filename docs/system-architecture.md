# System Architecture

## Overview
ApexOS is a high-performance trading platform built on Next.js 16, utilizing Supabase for backend services and a specialized AI engine for trading signals.

## Core Components

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 + Tailwind CSS v4
- **State Management**: Zustand

### Backend Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **Security**: Row Level Security (RLS) enforced on all tables

### Security Architecture

#### Webhook Integration (Polar.sh)
- **Signature Verification**: All incoming webhooks from Polar.sh are verified using the `Polar-Webhook-Signature` header.
- **Raw Body Handling**: Verification is performed on the raw request body buffer to ensure byte-for-byte accuracy.
- **Replay Protection**: Timestamps are validated to prevent replay attacks.

#### Dependency Management
- **Vulnerability Scanning**: Automated `npm audit` in CI/CD.
- **Overrides**: `package.json` overrides used to mitigate vulnerabilities in transitive dependencies.

## CI/CD Pipeline
- **Provider**: GitHub Actions
- **Stages**: Lint -> Build -> Test -> Deploy
- **Quality Gates**:
  - 100% Test Pass Rate
  - Zero Critical Vulnerabilities
