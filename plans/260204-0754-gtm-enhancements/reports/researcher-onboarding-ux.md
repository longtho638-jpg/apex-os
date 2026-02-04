# Research Report: User Onboarding for Trading Platforms
**Date:** 2026-02-04
**Status:** COMPLETE
**Focus:** Quick Wins, Trading Specifics, Libraries
**Context:** ApexOS GTM Enhancements

## 1. Quick Wins (1-2 Weeks Implementation)
These patterns yield the highest impact/effort ratio for fintech users who value speed and clarity.

*   **Contextual "Hotspots" (Beacon)**: Instead of a long tour, place pulsing beacons on critical elements (e.g., "Deposit" or "Buy Order"). User clicks -> Tooltip appears.
    *   *Why:* Reduces cognitive load; users learn on-demand.
*   **Empty State Education**: Never show an empty Watchlist or Portfolio.
    *   *Action:* Pre-fill Watchlist with major assets (BTC, ETH, SOL) + "Add Asset" button.
    *   *Action:* In empty Portfolio, show "Fund Account" CTA or "Try Demo Trade".
*   **Progressive Disclosure checklist**: A persistent "Setup Guide" widget (0/4 complete).
    *   Steps: Verify Identity → Deposit Funds → Create Watchlist → Make First Trade.
    *   *Psychology:* Leverages the "Zeigarnik effect" (desire to complete unfinished tasks).

## 2. Trading Platform Specific Patterns
*   **Demo/Sandbox Mode (Critical)**:
    *   Allow toggling `Live` vs `Paper Trading` in the header.
    *   *Onboarding:* Force new users into Paper Mode with $10k virtual balance to execute their first "risk-free" trade.
*   **The "First Trade" Hand-holding**:
    *   Don't just show the button. Walk through the *Confirmation Screen*.
    *   Explain "Market" vs "Limit" briefly in a tooltip during order entry.
*   **Risk Friction**:
    *   Use friction positively. Require a "I understand this is a high-risk asset" checkbox for volatile tokens. This builds trust through responsibility.

## 3. Terrain Analysis: ApexOS Codebase Status
*   **✅ Paper Trading Engine**: Fully implemented in `src/lib/trading/paper-trading.ts`. Supports `createWallet` and `executeTrade`.
    *   *Action:* Leverage this immediately for the "First Trade" onboarding step.
*   **⚠️ Demo Mode**: Currently scattered mocks (e.g., `isDemo` flags in `useRealPortfolioReturns`, hardcoded `demo@apexrebate.com`).
    *   *Action:* Unify into a global `TradingModeProvider` context to toggle UI states cleanly.
*   **❌ Faucets**: No internal faucet found.
    *   *Action:* Need to implement a simple `POST /api/v1/trading/paper/faucet` endpoint to let users "refill" their paper balance during onboarding.

## 4. Top Libraries & Tools (React/Next.js Compatible)

### A. React Joyride (Best for React Native/Web)
*   **GitHub**: ~6.2k stars | **License**: MIT
*   **Pros**: Component-based, highly customizable, widely used.
*   **Cons**: Can be verbose.

```tsx
// Example: Simple First Trade Tour
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: '.market-selector',
    content: 'Step 1: Choose an asset to trade (e.g., BTC/USD).',
    disableBeacon: true,
  },
  {
    target: '.order-form',
    content: 'Step 2: Enter amount and click Buy. Try a Market order for speed.',
  }
];

export const OnboardingTour = () => (
  <Joyride
    steps={steps}
    continuous
    showSkipButton
    styles={{
      options: { primaryColor: '#0052CC' }
    }}
  />
);
```

### B. Driver.js (Best Lightweight / Vanilla compatible)
*   **GitHub**: ~21k stars | **License**: MIT
*   **Pros**: Zero-dependency, framework-agnostic, very smooth.
*   **Cons**: Imperative API.

```tsx
// Example: Highlighting the Deposit Button
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const drive = driver({
  showProgress: true,
  steps: [
    { element: '#deposit-btn', popover: { title: 'Fund Account', description: 'Start here.' } }
  ]
});
// Trigger on mount
drive.drive();
```

## 5. Recommendations
1.  **Immediate**: Install **`react-joyride`** (safest bet for Next.js app router).
2.  **Implementation**: Create a `OnboardingWizard` component that:
    - Checks if user has 0 trades.
    - If true, auto-activates "Paper Mode" (using existing backend).
    - Triggers the 3-step tour: *Select Asset* -> *Enter Amount* -> *Execute Paper Trade*.
3.  **Gap Fill**: Implement the missing `faucet` endpoint to ensure users can always test.

## Unresolved Questions
*   **Resolved:** The `execute_paper_trade` RPC is permissioned for `authenticated` users (verified in migration `20251128`). Non-KYC users can access it as long as they are signed in.
