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
