# Apex OS — Security Documentation

**Version:** 1.0 | **Last Updated:** 2026-03-01 | **Status:** Production

---

## 1. Authentication

### Supabase Auth + JWT

- All user sessions managed via Supabase Auth (email/password + OAuth)
- JWT signed with `SUPABASE_JWT_SECRET`; verified in middleware via `jose.jwtVerify()`
- Service Role key (`SUPABASE_SERVICE_ROLE_KEY`) used only server-side, never exposed to client
- Token validation in `src/middleware.ts` before any protected route is reached

### MFA (TOTP)

- TOTP-based MFA enforced for all admin accounts (`admin_users` table)
- Setup flow: `/admin/security/mfa/setup` → QR scan → recovery codes
- Recovery codes stored hashed in `mfa_recovery_codes` table
- Failed MFA attempts tracked; 5+ failures from same IP → security alert + rate block

### Session Management

- Session timeout: 1 hour (enforced via Supabase JWT expiry)
- Force re-authentication: `DELETE FROM admin_sessions WHERE created_at < NOW()`
- IP whitelist optional per admin: `admin_users.ip_whitelist_enabled`

---

## 2. Authorization

### Role-Based Access

| Role | Access |
|------|--------|
| `user` | Own data only (orders, positions, wallet, referrals) |
| `leader` | Copy trading leader features + own data |
| `admin` | All user data via service role, admin dashboard |
| `super_admin` | Full system access including security configuration |

### Row Level Security (RLS)

RLS enforced at PostgreSQL layer — bypasses are impossible from client.

| Table | Read Policy | Write Policy |
|-------|------------|-------------|
| `user_tiers` | Own row only (`auth.uid()`) | Service role only |
| `referral_network` | Own referrer/referee rows | Service role only |
| `commission_transactions` | Own rows only | Service role only |
| `commission_pool` | All authenticated users | Service role only |
| `viral_metrics` | All authenticated users | Service role only |
| `orders` / `positions` | Own rows only | Service role (execution) |
| `wallets` | Own row only | Service role only |
| `audit_logs` | Admin/super_admin only | Service role only |

### Enterprise Auth Middleware

`src/middleware/enterprise-auth.ts` guards `/admin/*` routes:
- Validates JWT + admin role claim
- Checks IP whitelist if enabled for that admin
- Logs all admin access attempts to `audit_logs`

---

## 3. API Security

### Rate Limiting

- Redis-backed, IP-keyed counters with TTL
- Default: **10 req/min** on all `/api/*` routes
- Applied in `src/middleware.ts` before route handlers
- `src/middleware/rateLimit.ts` returns 429 with `Retry-After` header

### CSRF Protection

- `src/middleware/csrf.ts` injects CSRF token into SSR pages
- All state-mutation requests (POST/PUT/DELETE) validated against token
- Double-submit cookie pattern

### Input Validation

- All API route handlers use **Zod** schemas for request body/query validation
- Validation errors return structured 400 responses; raw errors never exposed
- JSON-LD output sanitized via `safeJsonLd()` (XSS-safe escaping)

### CORS

- Configured for production domain only (`apexrebate.com`)
- Vercel preview deployments treated as main domain for testing

### Webhook Security (Polar.sh)

- Signature verified via `Polar-Webhook-Signature` header
- Verification on raw body buffer (byte-exact, prevents manipulation)
- Timestamp validation prevents replay attacks (15-minute window)

---

## 4. Data Security

### Encryption

- **At rest:** Supabase/PostgreSQL AES-256 encryption (managed)
- **In transit:** TLS 1.3 enforced on all connections (Vercel + Nginx)
- **Secrets:** All credentials in environment variables; never committed to Git

### Sensitive Data Handling

- PII redacted from all application logs
- API keys encrypted at env level; `VAULT_KEY_MASTER` for key rotation
- No sensitive data in client-side bundles or localStorage

### Key Rotation Protocol

```bash
# Rotate JWT secret
openssl rand -base64 32  # generate new secret
# Update SUPABASE_JWT_SECRET in Vercel + VPS env
# Force re-login: invalidate all active sessions
```

---

## 5. Infrastructure Security

### Environment Management

- `.env.local` and `.env.production` excluded via `.gitignore`
- Production secrets managed in Vercel dashboard + VPS environment
- Separate keys for dev / staging / production (never shared)

### Dependency Security

- `npm audit` runs in CI/CD pipeline — **zero high/critical vulnerabilities** gate
- `package.json` overrides patch transitive dependency vulnerabilities
- Dependency review on every PR

### Security Headers

Configured via `next.config.js` / Vercel:

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-...'` |

### Agent Security

- Guardian Agent monitors: volume spikes, unusual trading patterns, multiple failed logins
- Auditor Agent: financial reconciliation every cycle; mismatch → P0 alert
- Both agents report to `security_alerts` table; admin dashboard at `/admin/security/alerts`

---

## 6. Compliance (SOC2 Control Mapping)

| SOC2 Control | Implementation |
|-------------|---------------|
| CC6.1 Logical access | Supabase Auth + RLS + RBAC |
| CC6.2 Authentication | JWT + MFA (TOTP) for admins |
| CC6.3 Access removal | Service role revocation + session invalidation |
| CC7.1 Vulnerability mgmt | `npm audit` in CI/CD, dependency overrides |
| CC7.2 Monitoring | Sentry + Guardian Agent + audit_logs |
| CC9.2 Incident response | Documented playbook (INCIDENT_RESPONSE.md) |
| A1.2 Availability | Vercel auto-scale + PM2 autorestart + uptime monitoring |

### SOC2 Trust Service Criteria (Expanded)

| Criteria | Control | Evidence |
|---------|---------|---------|
| CC1 (Control Environment) | RBAC + RLS enforced at DB layer | RLS policies in migrations |
| CC2 (Communication) | Security alerts → admin dashboard | `security_alerts` table + Sentry |
| CC3 (Risk Assessment) | Guardian Agent anomaly detection | `security_alerts` entries |
| CC4 (Monitoring) | Sentry APM + audit_logs + uptime | Sentry org dashboard |
| CC5 (Control Activities) | Automated CI/CD gates (lint, audit, test) | GitHub Actions logs |
| CC6 (Logical Access) | JWT + MFA + RLS + IP whitelist | middleware.ts + enterprise-auth.ts |
| CC7 (System Operations) | PM2 autorestart + Vercel auto-scale | PM2 ecosystem.config.js |
| CC8 (Change Management) | PR reviews + CI gates before merge | Branch protection rules |
| CC9 (Risk Mitigation) | Incident playbook + on-call rotation | INCIDENT_RESPONSE.md |
| A1 (Availability) | Multi-region Vercel + VPS + Redis HA | Deployment architecture |

### JWT Token Lifecycle

```
[User Login]
     |
     v
Supabase Auth issues:
  access_token  (JWT, 1hr TTL)
  refresh_token (opaque, 7 days TTL)
     |
     v
[Every Request]
  middleware.ts → jose.jwtVerify(token, SUPABASE_JWT_SECRET)
  → Invalid / expired → 401 Unauthorized
  → Valid → decode claims (sub=userId, role, exp)
     |
     v
[Token Refresh] (client-side, Supabase SDK)
  refresh_token → Supabase Auth → new access_token
  → Rotation: old refresh_token invalidated on use
     |
     v
[Revocation]
  Admin action OR security event:
  DELETE FROM admin_sessions WHERE user_id = ?
  → Next request: JWT still valid until exp
  → Force-expire: SUPABASE_JWT_SECRET rotation
     |
     v
[Expiry]
  access_token TTL 3600s → automatic logout
  refresh_token TTL 7d   → full re-authentication required
```

### MFA Implementation Details

**Algorithm:** TOTP (RFC 6238) — HMAC-SHA1, 6-digit, 30s window

```
Setup:
  1. Generate 20-byte random secret (base32-encoded)
  2. QR code: otpauth://totp/ApexOS:{email}?secret={base32}&issuer=ApexOS
  3. User scans → authenticator app
  4. Verify with 1 code before enabling (confirms app sync)
  5. Generate 10 recovery codes (12 chars, alphanumeric, hashed bcrypt)
  6. Store: mfa_secrets(user_id, secret_encrypted, enabled_at)
  7. Store: mfa_recovery_codes(user_id, code_hash, used_at)

Verification:
  TOTP window: ±1 interval (30s drift tolerance)
  Brute-force: 5 failed attempts → 15min lockout + security_alert insert
  Recovery: code used → marked used (single-use), alert logged

Recovery Code Generation:
  crypto.randomBytes(9).toString('base64url').slice(0, 12).toUpperCase()
  → 10 codes generated at setup
  → Displayed once (raw), stored hashed
  → Admin can regenerate (invalidates old set)
```

---

## 7. Incident Response (Summary)

Full playbook: `docs/INCIDENT_RESPONSE.md`

| Severity | Trigger | Response Time | First Action |
|---------|---------|--------------|-------------|
| P0 Critical | Data breach / admin compromise | < 5 min | Disable features, revoke sessions, notify team |
| P1 High | MFA bypass / security feature circumvention | < 30 min | Isolate user, reset credentials |
| P2 Medium | Volume spike / repeated failed logins | < 2 hours | Enhanced monitoring, investigate pattern |
| P3 Low | Single anomaly | < 24 hours | Log, review next cycle |

### Emergency Containment Commands

```sql
-- Freeze user account
UPDATE users SET status = 'frozen' WHERE id = 'USER_ID';

-- Revoke all admin sessions
DELETE FROM admin_sessions WHERE created_at < NOW();

-- Disable IP whitelist globally (emergency)
UPDATE admin_users SET ip_whitelist_enabled = false;
```

```bash
# Stop compromised agents
pm2 stop guardian && pm2 stop auditor

# Export audit logs for forensics
curl -X POST https://apexrebate.com/api/v1/admin/audit-logs/export \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"format":"json"}' > incident-$(date +%Y%m%d).json
```

---

## 8. Security Checklist (Production Gate)

### OWASP Top 10 Mitigations

| OWASP Risk | Mitigation | Implementation |
|-----------|-----------|---------------|
| A01 Broken Access Control | RLS on all tables; RBAC enforced | Supabase RLS policies + middleware |
| A02 Cryptographic Failures | AES-256 at rest; TLS 1.3 in transit | Supabase managed + Vercel/Nginx |
| A03 Injection | Zod validation; Supabase parameterized queries | All API handlers use Zod schemas |
| A04 Insecure Design | Threat modeling per feature; RLS default-deny | RLS policies block unintended access |
| A05 Security Misconfiguration | Security headers; env separation | next.config.js headers + .gitignore |
| A06 Vulnerable Components | `npm audit` CI gate (0 high/critical) | GitHub Actions CI check |
| A07 Auth Failures | JWT + MFA; brute-force lockout; session TTL | middleware.ts + MFA brute-force guard |
| A08 Software Integrity | Signed commits; dependency lock file | package-lock.json + PR reviews |
| A09 Logging Failures | audit_logs all admin actions; Sentry errors | enterprise-auth.ts + Sentry DSN |
| A10 Server-Side Request Forgery | No internal URL fetch from user input | Validated API endpoints only |

### Dependency Security Pipeline

```
[Developer opens PR]
        |
        v
[GitHub Actions: npm audit]
  → 0 high/critical: PASS → continue CI
  → high/critical found: FAIL → block merge
        |
        v
[CI Gate: package.json overrides]
  Transitive vulns patched via "overrides" field
  Example: "overrides": { "semver": "^7.5.2" }
        |
        v
[Weekly: Dependabot PRs]
  Auto-opens PRs for patch/minor updates
  Security updates: auto-merge if CI passes
  Major updates: manual review required
        |
        v
[Manual Review (quarterly)]
  Full audit of all direct dependencies
  Remove unused packages (npm ls --depth=0)
  Review package download counts / ownership
  Check for abandoned packages (last publish > 2yr)
```

- [x] RLS enabled on all Supabase tables
- [x] JWT secret strong (32+ bytes, rotated from dev)
- [x] Rate limiting active (Redis, 10 req/min)
- [x] CORS locked to production domain
- [x] Zod validation on all API inputs
- [x] Webhook signature verification (Polar.sh)
- [x] `npm audit` — 0 high/critical vulnerabilities
- [x] No secrets in Git (`.gitignore` enforced)
- [x] Sentry active for error tracking
- [x] Audit logs capturing all admin actions
- [ ] MFA enforced for all admins (manual setup required)
- [ ] WAF (Cloudflare) enabled
- [ ] Pen testing scheduled before full launch
- [ ] On-call rotation defined
