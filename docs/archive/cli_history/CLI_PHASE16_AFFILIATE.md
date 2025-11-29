# CLI PHASE 16: AFFILIATE PARTNER PORTAL (THE TRAFFIC ARMY)

## Strategic Context: 借刀殺人 (Borrow a Knife to Kill)

**Sun Tzu Principle**: "Kill with a borrowed knife." (Use others to do your work)

**Application**: We don't have an ad budget. We use KOLs/Influencers ("The Knife") to acquire users for us. We give them the best tools so they *want* to sell our product.

**Objective**: Recruit 100 Affiliates -> 10,000 Users.
**Timeline**: Week 6 (2-3 days CLI execution)

---

## TASK 1: PARTNER DASHBOARD

### 1.1 Database Schema
**File**: `supabase/migrations/20251128_affiliate_system.sql` (NEW)

```sql
CREATE TABLE affiliate_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  clicks INTEGER DEFAULT 0,
  signups INTEGER DEFAULT 0,
  paid_conversions INTEGER DEFAULT 0,
  total_commission NUMERIC DEFAULT 0,
  pending_payout NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount NUMERIC NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'rejected')),
  method TEXT, -- 'crypto', 'paypal'
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

### 1.2 Dashboard UI
**File**: `src/app/[locale]/affiliate/dashboard/page.tsx` (NEW)

**Features**:
- Metrics: Clicks, Signups, Earnings.
- Referral Link Generator (Custom params like `?ref=KOL_NAME&source=twitter`).
- Graph: Earnings over time.

---

## TASK 2: MARKETING ASSETS LIBRARY

### 2.1 Asset Gallery
**File**: `src/app/[locale]/affiliate/assets/page.tsx` (NEW)

**Content**:
- **Banners**: High-res images (Trading Win Screenshots, "AI Trading" visuals).
- **Swipe Copy**: Pre-written tweets/emails.
  - "How I made $500 in 2 hours with ApexOS AI 🚀"
  - "Stop trading manually. Let AI do it. 🤖"

### 2.2 Download Logic
- Simple "Copy to Clipboard" or "Download" buttons.

---

## TASK 3: PAYOUT SYSTEM

### 3.1 Payout API
**File**: `src/app/api/affiliate/payout/request/route.ts` (NEW)

**Logic**:
- Check `pending_payout` balance > $50 (Min withdrawal).
- Create `payout_requests` record.
- Deduct from `pending_payout` (Lock funds).

### 3.2 Admin Payout View
**File**: `src/app/[locale]/admin/finance/payouts/page.tsx` (NEW)

**Logic**:
- List pending requests.
- "Mark Paid" button (Manual process initially or connect to Mass Payout API later).

---

## DELIVERABLES

1. ✅ **Partner Dashboard**: Professional tracking for KOLs.
2. ✅ **Asset Library**: "Plug & Play" marketing materials.
3. ✅ **Cashflow**: Automated payout requests.

---

## EXECUTION COMMAND

```bash
Execute PHASE 16 (Affiliate Partner Portal)

Implement:
1. Partner Dashboard (DB + UI)
2. Marketing Assets Library
3. Payout Request System

Quality:
- TypeScript strict mode
- Mobile responsive (KOLs work on phone)
- Build: 0 errors
```
