# CLI PHASE 18: INSTITUTIONAL GRADE SECURITY (THE VAULT)

## Strategic Context: 守如處女 (Guard like a Virgin)

**Sun Tzu Principle**: "Use security to make yourself invincible."

**Application**: We build a "Vault" so whales trust us with their capital. No 2FA = No Institutional Clients.

**Objective**: Achieve SOC2-ready security posture.
**Timeline**: Week 6 (2-3 days CLI execution)

---

## TASK 1: 2FA (TOTP)

### 1.1 Dependencies
```bash
npm install speakeasy qrcode
```

### 1.2 Database Schema
**File**: `supabase/migrations/20251128_security_vault.sql` (NEW)

```sql
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN recovery_codes TEXT[];

CREATE TABLE active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'login', '2fa_enable', 'withdraw'
  ip_address TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 API Routes
- `src/app/api/user/2fa/setup/route.ts` (Generate Secret + QR)
- `src/app/api/user/2fa/verify/route.ts` (Verify Token & Enable)

### 1.4 UI Component
**File**: `src/components/security/TwoFactorSetup.tsx` (NEW)

---

## TASK 2: SESSION MANAGER

### 2.1 Middleware Logic
**File**: `src/middleware/session-check.ts` (NEW)

**Logic**:
- Hash session token from cookie.
- Check `active_sessions` table.
- Update `last_active`.

### 2.2 Dashboard UI
**File**: `src/app/[locale]/dashboard/security/sessions/page.tsx` (NEW)

**Features**:
- List active devices (IP, Browser, Location).
- "Revoke All" button.

---

## TASK 3: AUDIT LOG SYSTEM

### 3.1 Logger Utility
**File**: `src/lib/security/audit-logger.ts` (NEW)

```typescript
export async function logSecurityEvent(userId: string, action: string, req: NextRequest) {
  // Insert into security_audit_logs
}
```

### 3.2 Integration
- Add logging to: Login, Withdrawal, API Key Creation.

---

## DELIVERABLES

1. ✅ **2FA**: Google Authenticator support.
2. ✅ **Session Control**: Remote logout capability.
3. ✅ **Audit Trail**: Full history of sensitive actions.

---

## EXECUTION COMMAND

```bash
Execute PHASE 18 (Security Vault)

Implement:
1. 2FA System (Setup + Verify)
2. Session Management (DB + Middleware)
3. Audit Logging (Utility + Integration)

Quality:
- Security First (Secrets encrypted/hashed)
- Build: 0 errors
```
