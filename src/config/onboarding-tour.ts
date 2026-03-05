/**
 * Onboarding Tour Configuration
 *
 * Defines tour steps for first-time users
 */

import type { Step } from 'react-joyride';

export const ONBOARDING_STEPS: Step[] = [
  {
    target: '[data-tour="wallet"]',
    content: 'This is your wallet balance. Start with paper money to practice risk-free!',
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="order-form"]',
    content: 'Use this form to place trades. Select Buy or Sell, enter amount, and execute.',
    placement: 'left',
  },
  {
    target: '[data-tour="chart"]',
    content: 'Monitor price movements in real-time with this chart.',
    placement: 'top',
  },
  {
    target: '[data-tour="positions"]',
    content: 'Your open positions and recent trades appear here.',
    placement: 'top',
  },
  {
    target: '[data-tour="paper-faucet"]',
    content: 'Click here anytime to add more paper funds for practice trading!',
    placement: 'bottom',
  },
];

export const TOUR_OPTIONS = {
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  styles: {
    options: {
      primaryColor: '#3b82f6', // blue-600
      zIndex: 10000,
    },
  },
  locale: {
    back: 'Back',
    close: 'Close',
    last: 'Finish',
    next: 'Next',
    skip: 'Skip Tour',
  },
};
