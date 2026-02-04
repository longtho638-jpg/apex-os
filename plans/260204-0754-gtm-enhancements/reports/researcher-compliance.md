# Compliance & Regulatory Research for ApexOS

**Date:** 2026-02-04
**Status:** DRAFT
**Focus:** Minimal MVP Compliance (Launch Readiness)

## 1. Quick Wins (1-2 Weeks Implementation)

### A. Terms & Privacy (The "Paper" Shield)
*   **Terms of Service (ToS)**: Must explicitly state "ApexOS provides software, not financial advice." Users must agree before creating an account.
*   **Privacy Policy**: Required by GDPR/CCPA. Must disclose data collection (Supabase, logs) and processors (Stripe, Vercel).
*   **Implementation**:
    *   **UI**: Mandatory checkbox on Sign Up form: *"I agree to the Terms of Service and Privacy Policy."*
    *   **Storage**: Store `accepted_terms_at` timestamp and `terms_version` in `auth.users` metadata or a `profiles` table.

### B. Cookie Consent (GDPR)
*   **Requirement**: Block non-essential cookies until consent.
*   **Solution**:
    *   **Library**: `vanilla-cookieconsent` (Lightweight, no dependency) or `react-cookie-consent`.
    *   **SaaS**: **CookieYes** (Free tier covers 25k pageviews, auto-scan).
*   **Recommendation**: Use **CookieYes** for speed/compliance; switch to custom library if UI customization is critical.

### C. Audit Logging (Security)
*   **Goal**: Track critical actions (login, trade execution, settings change).
*   **Implementation (Supabase)**:
    *   Create `audit_logs` table (RLS enabled, insert-only).
    *   Use **Postgres Triggers** for data changes or **Next.js Middleware** for access logs.
    *   **Minimal viable log**: `user_id`, `action`, `resource_id`, `ip_address`, `timestamp`.

### D. User Data Export (GDPR Art. 15)
*   **Goal**: Allow users to download their data.
*   **Implementation**:
    *   Server Action: `exportUserData(userId)`.
    *   Fetches profile, audit logs, trade history.
    *   Returns a JSON file download.

## 2. Trading Compliance Basics

### A. KYC/AML (Know Your Customer)
*   **Why**: Required if handling fiat or custodying funds. (Less critical if non-custodial/software-only, but recommended for Stripe access).
*   **Providers**:
    *   **Stripe Identity**: Best for integration speed. ~$1.50 per verification. Seamless flow if using Stripe for payments.
    *   **Persona**: "Starter" plan is free for first 500 verifications/month. Very developer-friendly.
    *   **Onfido**: Enterprise-focused, typically expensive minimums.
*   **Recommendation**: **Stripe Identity** (if using Stripe) or **Persona** (if cost-sensitive).

### B. Risk Disclosures
*   **Requirement**: Prominent warning about trading risks.
*   **Placement**: Footer of every page + explicit acceptance during onboarding.
*   **Text Template**: *"Trading involves significant risk and can result in the loss of your invested capital. You should not invest more than you can afford to lose."*

## 3. Recommended Tools & Services

| Category | Tool | Pricing | Notes |
| :--- | :--- | :--- | :--- |
| **Legal Docs** | **Termly** | Free (1 policy) / $10/mo | Good generator, compliant. |
| | **Avodocs** | Free | YC-backed legal templates. |
| **Cookie Consent** | **CookieYes** | Free (25k views/mo) | Easiest setup. |
| | **vanilla-cookieconsent** | Open Source | Full code control. |
| **KYC** | **Stripe Identity** | ~$1.50/check | Best DX. |
| | **Persona** | Free (500/mo) | Best startup value. |
| **Audit Logs** | **Supabase** | Included | Built-in Postgres capabilities. |

## 4. Unresolved Questions
1.  **Custody**: Does ApexOS hold user funds? (If YES, compliance burden increases 10x).
2.  **Jurisdiction**: Are US customers supported? (Requires strict CFTC/SEC adherence).
3.  **Payment Methods**: Crypto vs Fiat? (Crypto-only often has lower initial friction but complex off-ramps).

---
**Sources:**
- [Stripe Identity Pricing](https://stripe.com/identity/pricing)
- [Persona Pricing](https://withpersona.com/pricing)
- [CookieYes](https://www.cookieyes.com/)
