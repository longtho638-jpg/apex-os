# CLI PHASE 11: GROWTH ACCELERATION (TĂNG TỐC DOANH THU)

## Strategic Context: 運籌帷幄 (Strategic Planning)

**Sun Tzu Principle**: "The general who wins a battle makes many calculations in his temple ere the battle is fought."

**Application**: We cannot grow what we cannot measure. We need a "God View" dashboard to see every dollar and every user drop-off point. Then we automate the "closing" process.

**Objective**: Increase conversion rate from 2% to 5%.
**Timeline**: Week 4 (2-3 days CLI execution)

---

## TASK 1: ADMIN ANALYTICS DASHBOARD (GOD VIEW)

### 1.1 Revenue Metrics API
**File**: `src/app/api/admin/analytics/revenue/route.ts` (NEW)

**Metrics**:
- **MRR** (Monthly Recurring Revenue): Sum of all active monthly subscriptions.
- **ARR** (Annual Recurring Revenue): MRR * 12.
- **Churn Rate**: % of users who canceled this month.
- **LTV** (Lifetime Value): Average revenue per user before churning.

### 1.2 Funnel Visualization API
**File**: `src/app/api/admin/analytics/funnel/route.ts` (NEW)

**Stages**:
1. **Visitors** (Unique landing page views).
2. **Signups** (Users created).
3. **Activations** (Connected exchange / API key).
4. **Conversions** (Paid subscription).

### 1.3 Dashboard UI
**File**: `src/app/[locale]/admin/analytics-dashboard/page.tsx` (NEW)

**Components**:
- Revenue Cards (MRR, ARR, etc.).
- Funnel Bar Chart (Recharts).
- Recent Transactions Table.

---

## TASK 2: SMART EMAIL DRIP (THE CLOSER)

### 2.1 Drip Campaign Cron
**File**: `src/app/api/cron/drip-campaign/route.ts` (NEW)

**Logic**:
- Run daily at 10:00 AM UTC.
- Check user `created_at`.
- **Day 0**: Welcome + "How to start".
- **Day 2**: "Did you see this?" (Show recent winning signals).
- **Day 6**: "Trial Ending" + Coupon `TRIAL20`.

**Email Templates**: Add to `src/lib/email-templates.ts`.

---

## TASK 3: TECHNICAL SEO OVERHAUL

### 3.1 Meta Tags Optimization
**File**: `src/app/layout.tsx` (MODIFY)

**Requirements**:
- Dynamic titles based on page content.
- Optimized descriptions.
- Canonical URLs.

### 3.2 Schema Markup
**File**: `src/components/seo/JsonLd.tsx` (NEW)

**Schemas**:
- `Organization` (Logo, Socials).
- `SoftwareApplication` (Pricing, Ratings).
- `FAQPage` (For pricing page).

### 3.3 Sitemap Enhancement
**File**: `src/app/sitemap.ts` (MODIFY)

**Add**:
- Priority 1.0 for Landing Page.
- Priority 0.8 for Blog Posts.
- Include `lastModified` dates.

---

## DELIVERABLES

1. ✅ **God View Dashboard**: Full visibility into revenue & funnel.
2. ✅ **The Closer**: Automated email sequence converting leads.
3. ✅ **SEO Foundation**: Google-ready technical setup.

---

## EXECUTION COMMAND

```bash
Execute PHASE 11 (Growth Acceleration)

Implement:
1. Admin Analytics Dashboard (MRR/ARR/Funnel APIs + UI)
2. Smart Email Drip (Cron + Templates)
3. Technical SEO (Metadata, Schema, Sitemap)

Quality:
- TypeScript strict mode
- 0 technical debt
- Mobile responsive
- Build: 0 errors
```
