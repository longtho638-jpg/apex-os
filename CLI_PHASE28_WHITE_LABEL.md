# CLI PHASE 28: THE WHITE LABEL SOLUTION (B2B SUITE)

## Strategic Context: 借殼上市 (Borrow a Corpse to Resurrect the Soul - Variant)

**Sun Tzu Principle**: "Use the resources of others to achieve your own goals."

**Application**: We license our technology to other businesses. They bring the users (and their trust), we provide the engine. We win without fighting for acquisition.

**Objective**: Onboard 5 B2B Partners ($50k Setup + $5k/mo each).
**Timeline**: Week 9 (2-3 days CLI execution)

---

## TASK 1: MULTI-TENANCY INFRASTRUCTURE

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_white_label.sql` (NEW)

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- 'fund-a', 'exchange-b'
  custom_domain TEXT UNIQUE,
  theme_config JSONB, -- { primaryColor: '#...', logoUrl: '...' }
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link users to tenants
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
```

### 1.2 Middleware Routing
**File**: `src/middleware.ts` (MODIFY)

**Logic**:
- Check `hostname`.
- If `partner.apexos.com` or `custom-domain.com`, rewrite request to `/_sites/[site]/...`.
- Inject `x-tenant-id` header.

---

## TASK 2: BRANDING ENGINE

### 2.1 Tenant Provider
**File**: `src/components/providers/TenantProvider.tsx` (NEW)

**Logic**:
- Fetch tenant config based on domain/slug.
- Inject CSS variables for colors.
- Provide `tenant` object context.

### 2.2 Theming
**File**: `src/app/globals.css` (MODIFY)
- Use CSS variables (`--primary`, `--bg-color`) instead of hardcoded colors.

---

## TASK 3: PARTNER PORTAL

### 3.1 Dashboard
**File**: `src/app/[locale]/partner/dashboard/page.tsx` (NEW)

**Features**:
- User Management (See their own users).
- Usage Stats (API calls, Active users).
- Branding Settings (Upload Logo, Pick Colors).

### 3.2 Onboarding Flow
**File**: `src/app/api/partner/onboard/route.ts` (NEW)

**Logic**:
- Create Tenant.
- Create Admin User for Tenant.
- Generate API Keys.

---

## DELIVERABLES

1. ✅ **Multi-Tenant Core**: One codebase, infinite brands.
2. ✅ **Custom Branding**: Partners feel like they own the platform.
3. ✅ **Partner Admin**: Self-serve management.

---

## EXECUTION COMMAND

```bash
Execute PHASE 28 (White Label)

Implement:
1. Tenant DB Schema
2. Multi-Tenant Middleware
3. Branding Engine & Partner Portal

Quality:
- TypeScript strict mode
- Zero leakage (Tenant A cannot see Tenant B data)
- Build: 0 errors
```
