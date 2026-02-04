# Phase 02: Compliance Foundation

**Context**: [Compliance Research Report](../reports/researcher-compliance.md)
**Priority**: High
**Status**: Pending

## Overview
To launch legally in target markets (EU, Vietnam, Global), we must implement mandatory compliance features including Terms of Service (ToS) acceptance tracking, GDPR/ePrivacy cookie consent, and user data controls.

## Key Insights
- "Clickwrap" agreement (active checkbox) is legally required; passive browsing acceptance is insufficient.
- Cookie consent must block non-essential scripts until accepted.
- Audit logs are critical for security and dispute resolution.

## Requirements
### Functional
- **ToS/Privacy**: Force users to accept updated terms on login/signup. Version tracking required.
- **Cookie Consent**: Banner with "Accept All", "Reject All", "Customize". Block Google Analytics/Pixel until consent.
- **Data Export**: Button for users to download their data (GDPR Right to Access).
- **Audit Logging**: Track critical actions (login, trade, withdrawal, settings change).

### Non-Functional
- Low latency on consent check.
- Cookie banner must not shift CLS (Cumulative Layout Shift).

## Architecture
- **Database**:
  - Add `tos_accepted_version` and `privacy_accepted_version` to `users` table (or separate tracking table).
  - Create `audit_logs` table (user_id, action, metadata, ip, timestamp).
- **Frontend**:
  - `CookieConsent` component (Client Component).
  - `TermsModal` component (blocks access if not accepted).
- **Services**:
  - `ComplianceService` for handling log insertion and data export aggregation.

## Related Code Files
- Modify: `src/lib/supabase/schema.sql` (Add columns/tables)
- Create: `src/components/compliance/CookieConsent.tsx`
- Create: `src/components/compliance/TermsModal.tsx`
- Create: `src/lib/services/audit-service.ts`
- Modify: `src/app/(auth)/login/page.tsx` (or auth callback)

## Implementation Steps
1.  **Schema Update**: Add audit logs table and user compliance columns.
2.  **Audit Service**: Implement `logAction(userId, action, data)` function. Use Supabase RLS to prevent user tampering.
3.  **ToS Interceptor**: Create middleware or layout check that redirects to `/compliance/accept` if versions mismatch.
4.  **Cookie Banner**: Implement simple banner storing preference in `localStorage` + `document.cookie`.
5.  **Data Export**: Create API route `/api/user/export` that aggregates user profile, trades, and logs into a JSON/CSV.

## Todo List
- [ ] Create `audit_logs` table migration
- [ ] Add `tos_version` to users
- [ ] Implement `CookieConsent.tsx`
- [ ] Implement `TermsModal.tsx` logic
- [ ] Build Data Export API endpoint
- [ ] Integrate Audit Log into critical actions

## Success Criteria
- User cannot access dashboard without accepting current ToS.
- Cookies are not set until user clicks "Accept".
- Admin can see user login history in internal dashboard (or database).

## Risk Assessment
- **Risk**: Blocking valid users if ToS version logic is buggy.
- **Mitigation**: Default to "accepted" for existing users if legally permissible, or thorough testing of the interception logic.

## Security Considerations
- Audit logs must be append-only (RLS: insert only, no update/delete for regular users).
- Data export must be strictly scoped to the requesting user.

## Next Steps
- Verify with legal team (if available) on specific text content.
