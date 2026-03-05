# Apex-OS RaaS AGI: SaaS → Multi-Org Hub-Package + Zero-Fee Crypto Exchange Agentic Workflow

## Overview
Chuyển đổi Apex-OS từ single-tenant SaaS sang multi-org Hub-Package model, tạo zero-fee crypto exchange agentic workflow.

## Current State
- `tenants` table tồn tại (white-label subdomain)
- Zero-fee spread model đã có (unified-tiers.ts)
- Enterprise API keys liên kết user, không org
- Middleware subdomain routing có nhưng `_sites` pages chưa build

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ⏳ | Organizations & Hub-Package DB Schema |
| 2 | ⏳ | Multi-Org Service Layer & Types |
| 3 | ⏳ | Agentic Workflow Engine |
| 4 | ⏳ | API Routes & Integration |
| 5 | ⏳ | UI Components |

## Architecture

```
Hub (Apex-OS Platform)
├── Organization A (White-label Exchange)
│   ├── Package: STARTER (basic trading)
│   ├── Users & Wallets
│   └── Agents: [price-feed, order-matcher]
├── Organization B (Fund)
│   ├── Package: PROFESSIONAL (algo + copy)
│   ├── Users & Wallets
│   └── Agents: [guardian, signal-gen, copy-engine]
└── Organization C (Institution)
    ├── Package: ENTERPRISE (full suite)
    ├── Users & Wallets
    └── Agents: [all + custom]
```

## Key Decisions
- Build ON TOP of existing `tenants` table → rename/extend to `organizations`
- Hub = platform admin, Package = feature bundle per org
- Agentic workflow = per-org autonomous agent fleet
- Zero-fee = spread-only revenue, configurable per org
