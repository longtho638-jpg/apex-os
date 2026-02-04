# GTM Enhancements: Implementation Guide

**Version:** 1.0
**Date:** 2026-02-04
**Status:** Production Ready

---

## Overview

This guide covers the GTM (Go-To-Market) enhancements implemented for Apex OS, including i18n support, compliance features, onboarding, payment enhancements, and multi-language content.

---

## 1. Internationalization (i18n)

### Supported Languages
- English (EN) - Default
- Vietnamese (VI)
- Thai (TH)
- Indonesian (ID)
- Korean (KO)
- Japanese (JA)
- Chinese (ZH)

### Configuration
All locale settings managed in `src/config/locales.ts`:
```typescript
import { locales, defaultLocale, isValidLocale } from '@/config/locales';
```

### URL Structure
- Primary: `/{locale}/path` (e.g., `/en/dashboard`, `/ja/trading`)
- Locale prefix: Always included
- Fallback: Redirects to EN if invalid locale

---

## 2. Compliance Features

### Terms of Service & Privacy Policy

**Database Columns:**
- `tos_accepted_version` - Current version accepted
- `tos_accepted_at` - Acceptance timestamp
- `privacy_accepted_version` - Privacy version accepted
- `privacy_accepted_at` - Privacy timestamp

**Current Versions:**
- ToS: v1.0 (effective 2026-02-04)
- Privacy: v1.0 (effective 2026-02-04)

**Usage:**
```tsx
import { TermsModal } from '@/components/compliance/TermsModal';
import { useComplianceCheck } from '@/hooks/useComplianceCheck';

const { needsAcceptance, acceptTerms } = useComplianceCheck();

<TermsModal
  isOpen={needsAcceptance}
  onAccept={acceptTerms}
  userEmail={user.email}
/>
```

### Cookie Consent

**Implementation:**
```tsx
import { CookieConsentBanner } from '@/components/compliance/CookieConsentBanner';

// Add to root layout
<CookieConsentBanner onConsentChange={(level) => console.log(level)} />
```

**Consent Levels:**
- `all` - All cookies allowed
- `essential` - Only essential cookies
- `none` - Reject all non-essential

**Storage:** `localStorage.getItem('apex_cookie_consent')`

### Data Export (GDPR Article 15)

**Endpoint:** `GET /api/v1/user/export`

**Returns:**
- User profile
- Wallet balances
- Orders (last 1000)
- Positions
- Audit logs (last 100)

**Format:** JSON download

---

## 3. User Onboarding

### Product Tour

**Installation:** `react-joyride` (already installed)

**Usage:**
```tsx
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';

<OnboardingTour
  hasCompletedOnboarding={user.onboarding_completed}
  onComplete={handleTourComplete}
/>
```

**Required:** Add `data-tour` attributes to UI elements:
```tsx
<div data-tour="wallet">Wallet</div>
<div data-tour="order-form">Order Form</div>
<div data-tour="chart">Chart</div>
<div data-tour="positions">Positions</div>
<div data-tour="paper-faucet">Faucet Button</div>
```

### Paper Trading Faucet

**Button Component:**
```tsx
import { PaperFaucetButton } from '@/components/onboarding/PaperFaucetButton';

<PaperFaucetButton />
```

**API:** `POST /api/paper/faucet`
- Amount: $10,000 USD
- Cooldown: 1 hour
- Only available in paper mode

---

## 4. Payment Enhancements

### Withdrawal UI

```tsx
import { WithdrawalModal } from '@/components/payments/WithdrawalModal';

<WithdrawalModal
  isOpen={showWithdrawal}
  onClose={() => setShowWithdrawal(false)}
  availableBalance={wallet.balance}
  currency="USD"
/>
```

**Methods:**
- Bank Transfer
- Crypto

**API:** `POST /api/v1/payments/withdraw`

### Transaction History

```tsx
import { TransactionHistory } from '@/components/payments/TransactionHistory';

<TransactionHistory />
```

**Features:**
- Lists all transactions
- Status badges
- Invoice download (PDF)

---

## 5. Database Migrations

### Required Migrations

Run these SQL files in order:
1. `src/database/migrations/add_compliance_tracking.sql`
2. Create `withdrawal_requests` table (if not exists)

**Compliance Columns:**
```sql
ALTER TABLE users
ADD COLUMN tos_accepted_version VARCHAR(20),
ADD COLUMN tos_accepted_at TIMESTAMPTZ,
ADD COLUMN privacy_accepted_version VARCHAR(20),
ADD COLUMN privacy_accepted_at TIMESTAMPTZ,
ADD COLUMN cookie_consent_given BOOLEAN DEFAULT false,
ADD COLUMN cookie_consent_at TIMESTAMPTZ;
```

---

## 6. Audit Logging

### Service Usage

```typescript
import { logAuditEvent, logUserLogin, logTosAcceptance } from '@/lib/services/audit-service';

// Manual logging
await logAuditEvent({
  userId: user.id,
  action: 'USER_LOGIN',
  resourceType: 'USER',
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// Helper functions
await logUserLogin(userId, ip, userAgent);
await logTosAcceptance(userId, '1.0', ip, userAgent);
```

---

## 7. Translation Workflow

### Current Status
- EN, VI: Fully translated
- TH, ID, KO, JA, ZH: Placeholder (English content)

### Production Translation Process
1. Export placeholder files from `messages/`
2. Send to Crowdin/Lokalise/DeepL
3. Import translated files
4. QA review by native speakers

---

## 8. Testing Checklist

### i18n
- [ ] Navigate to `/en`, `/vi`, `/ja`, `/zh`, `/th`, `/id`, `/ko`
- [ ] Verify no 404 errors
- [ ] Check language switcher works

### Compliance
- [ ] ToS modal appears for new users
- [ ] Cookie banner shows on first visit
- [ ] Data export downloads JSON

### Onboarding
- [ ] Tour starts on first login
- [ ] All 5 steps highlight correctly
- [ ] Faucet adds $10k to paper wallet
- [ ] Cooldown prevents spam

### Payments
- [ ] Withdrawal modal validates balance
- [ ] Transaction history loads
- [ ] Invoice download works

---

## 9. Deployment

### Environment Variables
Add to `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### Build
```bash
npm run build
```

### Verification
- TypeScript: `npx tsc --noEmit`
- Linting: `npm run lint`

---

## 10. Maintenance

### Updating ToS/Privacy Versions

1. Update `src/config/compliance.ts`:
```typescript
export const CURRENT_TOS_VERSION = '2.0';
export const CURRENT_PRIVACY_VERSION = '2.0';
```

2. Deploy - users will be prompted to re-accept

### Adding New Language

1. Add locale to `src/config/locales.ts`
2. Create `messages/{locale}.json`
3. Update metadata in `localeMetadata`
4. Deploy

---

## Support

For issues or questions, see:
- `/docs/project-overview-pdr.md`
- `/plans/260204-0754-gtm-enhancements/`

**Last Updated:** 2026-02-04
