# CLI PHASE 26: THE GRAND LAUNCH (OPERATION MONEY PRINTER)

## Strategic Context: 破釜沉舟 (Burn the Boats)

**Sun Tzu Principle**: "When your army has crossed the border, you should burn your boats and bridges, in order to make it clear to everybody that you have no longing for home."

**Application**: No turning back. We launch. The product is live. The world will see it.

**Objective**: 1000 Concurrent Users Day 1.
**Timeline**: The Final Push (1 day CLI execution)

---

## TASK 1: PRODUCTION POLISH (SEO & ROBOTS)

### 1.1 Robots.txt
**File**: `src/app/robots.ts` (NEW)

**Logic**:
- Allow all bots.
- Point to Sitemap.

### 1.2 SEO Verification
**Check**:
- `sitemap.ts` includes all new dynamic routes (Blog, Tools, Docs).
- `metadataBase` is set in `layout.tsx`.

---

## TASK 2: MARKETING IGNITION (MASS EMAIL)

### 2.1 Launch Email Template
**File**: `src/lib/email-templates.ts` (UPDATE)

**Content**: "We are LIVE! 🚀 50% Off for First 100 Users."

### 2.2 Broadcast Script
**File**: `scripts/launch-broadcast.ts` (NEW)

**Logic**:
- Fetch all users from `users` table.
- Send `launch` email via Resend (Batch 100).
- Log results.

---

## TASK 3: HEALTH CHECK SYSTEM

### 3.1 Diagnosis API
**File**: `src/app/api/health/diagnosis/route.ts` (NEW)

**Checks**:
- Database Connection (Supabase).
- Redis Connection (if used, or Cache).
- AI Service (OpenRouter Ping).
- Email Service (Resend Ping).

### 3.2 Status Page
**File**: `src/app/[locale]/status/page.tsx` (NEW)

**UI**:
- "All Systems Operational" (Green).
- Uptime 99.99%.

---

## DELIVERABLES

1. ✅ **SEO Ready**: Googlebot welcomed.
2. ✅ **Marketing Blast**: 1000 emails sent.
3. ✅ **System Healthy**: Green lights across the board.

---

## EXECUTION COMMAND

```bash
Execute PHASE 26 (The Grand Launch)

Implement:
1. Robots.txt & Sitemap Finalization
2. Launch Email Script
3. Health Diagnosis System

Quality:
- Production Verification
- Build: 0 errors
```
