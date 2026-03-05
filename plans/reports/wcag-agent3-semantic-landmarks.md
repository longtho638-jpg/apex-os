# WCAG Agent 3: Semantic HTML & Landmark Structure Report

**Date:** 2026-02-11
**Scope:** `apps/apex-os/src/components/` and `apps/apex-os/src/app/`
**Status:** Completed
**TypeScript:** All modified files compile cleanly (`npx tsc --noEmit`)

---

## 1. Page Landmark Structure (WCAG 1.3.1, 2.4.1)

### Navigation Landmarks

| File | Change |
|------|--------|
| `src/components/os/sidebar.tsx` | `<aside role="navigation">` to `<nav aria-label="Main navigation">` |
| `src/components/admin/AdminSidebar.tsx` | Outer `<div>` to `<aside>`, added `aria-label="Admin navigation"` to `<nav>` |
| `src/components/admin/AdminSecuritySidebar.tsx` | Added `aria-label="Security navigation"` to `<nav>` |
| `src/components/marketing/SiteHeader.tsx` | Added `aria-label="Main"` to desktop `<nav>`, mobile menu `<motion.div>` to `<motion.nav aria-label="Mobile">`, added `aria-expanded` + `aria-label="Toggle navigation menu"` to hamburger button |
| `src/components/layout/MobileNav.tsx` | Outer `<div>` to `<nav aria-label="Mobile navigation">` |
| `src/app/[locale]/dashboard/layout.tsx` | Added `aria-label="Mobile sidebar"` to mobile sidebar `<nav>` |

### Main Landmarks

| File | Change |
|------|--------|
| `src/app/[locale]/page.tsx` | Wrapped sections in `<main>` between SiteHeader/SiteFooter |
| `src/app/[locale]/landing/page.tsx` | Wrapped sections in `<main>` between SiteHeader/SiteFooter |
| `src/app/[locale]/pricing/page.tsx` | Wrapped sections in `<main>` between SiteHeader/SiteFooter |

### Section Labels

| File | Change |
|------|--------|
| `src/app/[locale]/page.tsx` | `aria-label="Hero"` on hero section, `aria-label="Final call to action"` on CTA section |
| `src/app/[locale]/landing/page.tsx` | `aria-label="Hero"` on hero section |

---

## 2. Heading Hierarchy (WCAG 1.3.1, 2.4.6)

### Legal Pages (LegalPageLayout provides h1)

| File | Change |
|------|--------|
| `src/app/[locale]/legal/terms/page.tsx` | All `<h3>` to `<h2>` (h1 from layout, sections are h2) |
| `src/app/[locale]/legal/privacy/page.tsx` | All `<h3>` to `<h2>` |
| `src/app/[locale]/legal/cookies/page.tsx` | All `<h3>` to `<h2>` |
| `src/app/[locale]/legal/security/page.tsx` | Card headings `<h4>` to `<h2>`, numbered sections `<h3>` to `<h2>` |

### Dashboard Pages

| File | Change |
|------|--------|
| `src/app/[locale]/dashboard/reports/page.tsx` | Page title `<h2>` to `<h1>` (was missing h1) |
| `src/app/[locale]/pricing/page.tsx` | Tier name headings `<h3>` to `<h2>` (h1 exists above) |

---

## 3. Tables (WCAG 1.3.1)

| File | `aria-label` | `scope="col"` count |
|------|-------------|---------------------|
| `src/app/[locale]/finance/components/TransactionTable.tsx` | `"Transaction history"` | 5 |
| `src/app/[locale]/admin/finance/components/WithdrawalQueue.tsx` | `"Pending withdrawals"` | 5 |
| `src/app/[locale]/admin/users/page.tsx` | `"User management"` | 7 |
| `src/app/[locale]/wolf-pack/page.tsx` | (already had label) | 4 |
| `src/app/[locale]/dashboard/reports/page.tsx` | `"Financial ledger"` | 5 |
| `src/components/admin/AuditLogViewer.tsx` | `"Audit logs"` | 6 |

---

## 4. Lists (WCAG 1.3.1)

All navigation components already use `<ul>`/`<li>` structure for link lists. No changes required.

---

## Files Modified (17)

1. `src/components/os/sidebar.tsx`
2. `src/components/admin/AdminSidebar.tsx`
3. `src/components/admin/AdminSecuritySidebar.tsx`
4. `src/components/admin/AuditLogViewer.tsx`
5. `src/components/marketing/SiteHeader.tsx`
6. `src/components/layout/MobileNav.tsx`
7. `src/app/[locale]/page.tsx`
8. `src/app/[locale]/landing/page.tsx`
9. `src/app/[locale]/pricing/page.tsx`
10. `src/app/[locale]/dashboard/layout.tsx`
11. `src/app/[locale]/dashboard/reports/page.tsx`
12. `src/app/[locale]/legal/terms/page.tsx`
13. `src/app/[locale]/legal/privacy/page.tsx`
14. `src/app/[locale]/legal/cookies/page.tsx`
15. `src/app/[locale]/legal/security/page.tsx`
16. `src/app/[locale]/admin/users/page.tsx`
17. `src/app/[locale]/wolf-pack/page.tsx`
18. `src/app/[locale]/finance/components/TransactionTable.tsx`
19. `src/app/[locale]/admin/finance/components/WithdrawalQueue.tsx`

## Remaining (Low Priority)

- ~19 additional tables in admin/component files could benefit from `scope="col"` and `aria-label`
- Some deeply nested dashboard pages may have minor heading hierarchy gaps
