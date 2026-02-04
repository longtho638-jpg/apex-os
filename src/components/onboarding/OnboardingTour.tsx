'use client';

/**
 * Onboarding Tour Component
 *
 * Interactive product tour for first-time users using react-joyride
 */

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import { ONBOARDING_STEPS, TOUR_OPTIONS } from '@/config/onboarding-tour';

export interface OnboardingTourProps {
  /**
   * Whether user has completed onboarding
   */
  hasCompletedOnboarding?: boolean;
  /**
   * Callback when tour is completed/skipped
   */
  onComplete?: () => void;
}

export function OnboardingTour({ hasCompletedOnboarding, onComplete }: OnboardingTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Start tour only if not completed
    if (!hasCompletedOnboarding) {
      // Delay tour start to ensure DOM is ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      onComplete?.();
    }
  };

  // Don't render if already completed
  if (hasCompletedOnboarding) return null;

  return (
    <Joyride
      steps={ONBOARDING_STEPS}
      run={run}
      callback={handleJoyrideCallback}
      {...TOUR_OPTIONS}
    />
  );
}
