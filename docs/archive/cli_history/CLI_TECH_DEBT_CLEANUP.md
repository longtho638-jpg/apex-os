# CLI TECH DEBT CLEANUP (DỌN NỢ KỸ THUẬT)

## Strategic Context: 亡羊補牢 (Mending the Fold)

**Sun Tzu Principle**: "If the fold is not mended after a sheep is lost, all sheep will be lost."

**Application**: We built fast to verify value (Proof of Concept). Now we must fortify the foundation before scaling, or the system will collapse under load.

**Objective**: Transition from "Mock/Dev" mode to "Production Hardened".
**Timeline**: Week 4 (1-2 days CLI execution)

---

## TASK 1: POSTHOG ANALYTICS (REPLACE MOCK)

### 1.1 Install Dependencies
```bash
npm install posthog-js
```

### 1.2 PostHog Client
**File**: `src/lib/posthog.ts` (NEW)

**Requirements**:
- Initialize PostHog only in browser (client-side).
- Capture pageviews automatically.
- Export `capture` function for custom events.

### 1.3 Refactor Analytics Wrapper
**File**: `src/lib/analytics.ts` (MODIFY)

**Logic**:
- Remove `console.log` mocks.
- Forward all `trackEvent` calls to PostHog.
- Keep the existing `analytics_events` DB logging as a backup (Double-Write).

---

## TASK 2: SENTRY INTEGRATION (OBSERVABILITY)

### 2.1 Install Dependencies
```bash
npx @sentry/wizard@latest -i nextjs
```
*(Note: Since I cannot run interactive wizards, I will manually configure the files)*

**Manual Setup**:
- `npm install @sentry/nextjs`
- Create `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`.
- Update `next.config.ts`.

### 2.2 Error Boundary
**File**: `src/app/global-error.tsx` (NEW)

**Logic**:
- Catch unhandled exceptions.
- Log to Sentry.
- Show a friendly "Something went wrong" UI.

---

## TASK 3: RESEND EMAIL SERVICE (HARDENING)

### 3.1 Install Dependencies
```bash
npm install resend
```

### 3.2 Refactor Email Service
**File**: `src/lib/email-service.ts` (MODIFY)

**Logic**:
- Remove all mock/console.log logic.
- Implement strict Resend API calls.
- Add error handling (try/catch).
- Return success/failure status clearly.

### 3.3 Update Usage
**Scan codebase** for direct `console.log('[Email]')` and replace with `sendEmail` from the hardened service.

---

## DELIVERABLES

1. ✅ **Real Analytics**: PostHog capturing events.
2. ✅ **Real Monitoring**: Sentry catching errors.
3. ✅ **Real Emails**: Resend delivering messages.

---

## EXECUTION COMMAND

```bash
Execute TECH DEBT CLEANUP

Implement:
1. PostHog Integration (Client + Wrapper)
2. Sentry Configuration (Manual Setup + Global Error)
3. Resend Refactoring (Strict SDK usage)

Quality:
- TypeScript strict mode
- No more "Mock" comments in core services
- Build: 0 errors
```
