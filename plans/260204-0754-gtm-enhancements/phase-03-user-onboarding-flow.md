# Phase 03: User Onboarding Flow

**Context**: [Onboarding Research Report](../reports/researcher-onboarding-ux.md)
**Priority**: High
**Status**: Pending

## Overview
New users need guidance to understand the complex trading interface. We will implement an interactive product tour using `react-joyride` and a "Paper Trading Faucet" to give them risk-free funds to learn with.

## Key Insights
- Trading interfaces are overwhelming; focused, step-by-step tours reduce bounce rates.
- "Learning by doing" (Paper Trading) is more effective than watching tutorials.

## Requirements
### Functional
- **Product Tour**: Highlight key elements: "Wallet", "Order Form", "Chart", "Positions".
- **Faucet**: One-click "Add $10k Paper USD" button for demo accounts.
- **Progress Tracking**: Dismiss tour permanently once completed.

### Non-Functional
- Tour should not appear on mobile (or have a mobile-specific simplified version).
- Faucet should have rate limits to prevent abuse (even if fake money, saves DB spam).

## Architecture
- **Frontend**:
  - `OnboardingTour` component wrapping `react-joyride`.
  - State management (Zustand) to track tour visibility.
- **Backend**:
  - API endpoint `/api/paper/faucet` to credit paper balance.
- **Database**:
  - `onboarding_completed` boolean in user preferences.

## Related Code Files
- Create: `src/components/onboarding/OnboardingTour.tsx`
- Create: `src/app/api/paper/faucet/route.ts`
- Modify: `src/store/user-store.ts` (add tour preference)
- Modify: `src/app/(dashboard)/trade/page.tsx` (add Joyride steps/classNames)

## Implementation Steps
1.  **Install Joyride**: Add `react-joyride` package.
2.  **Define Steps**: Create a config file for tour steps (target CSS selectors, content).
3.  **Add Selectors**: Add unique `id` or `data-tour` attributes to UI elements (Chart, Order Form, etc.).
4.  **Implement Faucet**: Create API route that adds virtual balance to `paper_balances` table.
5.  **Tour Logic**: Implement component that checks `onboarding_completed` status on mount.
6.  **Persistence**: Save completion status to DB when tour ends.

## Todo List
- [ ] Install `react-joyride`
- [ ] Create tour steps configuration
- [ ] Add `data-tour` attributes to dashboard components
- [ ] Implement `OnboardingTour` component
- [ ] Build `/api/paper/faucet` endpoint
- [ ] Connect "Skip/Finish" tour events to DB update

## Success Criteria
- New user sees tour on first login.
- Tour highlights elements accurately (no floating tooltips in wrong places).
- User can successfully claim paper funds and place a test trade.

## Risk Assessment
- **Risk**: UI changes break tour selectors.
- **Mitigation**: Use stable `data-tour` attributes instead of generic classes.

## Security Considerations
- Faucet API must check user is in "Paper Mode" and strictly limit amount/frequency.

## Next Steps
- Gather feedback from team on tour length (keep it under 5 steps).
