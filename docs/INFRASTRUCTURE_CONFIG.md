# Infrastructure Configuration Documentation
**Status:** Manual Configuration (ClickOps)
**Last Updated:** 2025-11-29

## 1. Vercel (Frontend)
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Environment Variables:**
  - `NEXT_PUBLIC_SUPABASE_URL`: [Production URL]
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: [Production Key]
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: [Cloudflare Key]

## 2. Render/Railway (Backend)
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile.backend`
- **Health Check Path:** `/api/health`
- **Environment Variables:**
  - `SUPABASE_URL`: [Production URL]
  - `SUPABASE_SERVICE_KEY`: [Secret]
  - `REDIS_URL`: `redis://...` (Internal Network)
  - `OPENROUTER_API_KEY`: [Secret]

## 3. Supabase (Database & Auth)
- **Region:** Singapore (sgp1)
- **Auth Providers:** Email/Password, Google
- **SMTP:** Resend (API Key configured in Auth Settings)
- **Realtime:** Enabled for `user_wallets`, `commission_events`
- **GraphQL:** Introspection DISABLED (Settings -> API -> GraphQL) - *Critical for Security*
