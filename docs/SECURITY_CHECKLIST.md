# Security Checklist for Production

## 1. Authentication & Access
- [x] RLS Policies enabled on all tables
- [x] JWT Secret strong and secure
- [ ] MFA enforced for Admin accounts
- [ ] Session timeout set to 1 hour

## 2. Network & API
- [x] Rate Limiting enabled (10 req/min default)
- [x] CORS configured for production domain only
- [x] API Inputs validated with Zod
- [ ] WAF (Web Application Firewall) enabled (Cloudflare)

## 3. Data Protection
- [x] Database backups enabled (Point-in-time)
- [x] No secrets committed to Git
- [ ] PII data encrypted at rest (Supabase handles this)

## 4. Monitoring & Incident Response
- [x] Sentry active
- [x] Uptime monitoring active
- [ ] On-call rotation schedule defined
- [ ] Incident Response Plan documented

---

## 5. SOC2 Type II Compliance

### CC1 — Control Environment
- [x] Security policies documented (this file)
- [x] Role-based access control (RBAC) enforced
- [ ] Annual security training for team members
- [ ] Background checks for privileged users

### CC2 — Communication & Information
- [x] Audit logs captured (audit-logger.ts)
- [x] Sentry for error visibility
- [ ] Security incident notification process documented
- [ ] Privacy policy and ToS published

### CC3 — Risk Assessment
- [x] Static analysis in CI (CodeQL)
- [x] Dependency vulnerability scanning (npm audit)
- [x] Secret scanning in CI (Gitleaks)
- [ ] Annual penetration test scheduled
- [ ] Formal risk register maintained

### CC6 — Logical and Physical Access
- [x] MFA implementation complete (TOTP + recovery codes)
- [x] Session invalidation via active_sessions table
- [x] JWT expiry enforced (1h session, 5m temp token)
- [x] RLS on all Supabase tables
- [x] API key management (src/lib/security/api-key.ts)
- [x] IP whitelist support (src/lib/security/ip-whitelist.ts)
- [ ] MFA enforced for all admin accounts (currently optional)
- [ ] Access reviews conducted quarterly

### CC7 — System Operations
- [x] Rate limiting on all API endpoints
- [x] Circuit breaker pattern implemented (circuit-breaker.ts)
- [x] Uptime monitoring active
- [ ] Automated alerting on anomalous traffic
- [ ] Runbook for common failure scenarios

### CC8 — Change Management
- [x] All changes via pull requests to main
- [x] CI pipeline required to pass before merge (test + lint + security scan)
- [x] Gitleaks prevents secret commits
- [ ] Change advisory board (CAB) process for major releases
- [ ] Rollback procedure documented per service
