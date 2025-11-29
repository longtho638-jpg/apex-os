import { analytics, AnalyticsEvent } from '@/lib/analytics';

// Simple wrapper for trackEvent to match usage in other files
function trackEvent(event: AnalyticsEvent, metadata: any) {
  analytics.track(event, metadata);
}

export type TriggerType = 'limit_reached' | 'win_achieved' | 'trial_ending' | 'missed_money';

interface UpgradeTrigger {
  type: TriggerType;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  discount?: string;
  value?: number;
}

export const upgradeTriggers = {
  // Trigger when user hits feature limit
  limitReached: (feature: string, currentLimit: number): UpgradeTrigger => {
    trackEvent('upgrade_trigger_shown', {
      trigger_type: 'limit_reached',
      feature 
    });

    return {
      type: 'limit_reached',
      message: `You've used ${currentLimit}/${currentLimit} free ${feature}. Upgrade to unlock unlimited!`,
      urgency: 'high',
    };
  },

  // Trigger when user has a winning trade
  winAchieved: (profit: number): UpgradeTrigger => {
    trackEvent('upgrade_trigger_shown', {
      trigger_type: 'win_achieved',
      profit 
    });

    return {
      type: 'win_achieved',
      message: `🎉 Your trade just made $${profit.toFixed(2)}! Upgrade to track more winning signals.`,
      urgency: 'medium',
      discount: 'FIRSTWIN20', // 20% off
    };
  },

  // Trigger 2 days before trial ends
  trialEnding: (daysLeft: number): UpgradeTrigger => {
    trackEvent('upgrade_trigger_shown', {
      trigger_type: 'trial_ending',
      days_left: daysLeft 
    });

    return {
      type: 'trial_ending',
      message: `⏰ Your trial ends in ${daysLeft} days. Upgrade now with code TRIAL20 for 20% off!`,
      urgency: 'high',
      discount: 'TRIAL20',
    };
  },

  // Trigger when commission is missed (Grace Period)
  missedCommission: (amount: number): UpgradeTrigger => {
    trackEvent('upgrade_trigger_shown', {
      trigger_type: 'missed_money',
      amount 
    });

    return {
      type: 'missed_money',
      message: `💰 You have $${amount.toFixed(2)} pending in your vault. Upgrade within 24h to claim it!`,
      urgency: 'high',
      value: amount
    };
  }
};

// Hook to check triggers (Mock implementation for now)
export function useUpgradeTriggers(userId: string) {
  // Check user's trial status, feature usage, recent trades
  // Return trigger if conditions met
  
  // Example: Check if trial ending
  const trialEndsAt = new Date('2025-12-05'); // from user data (mock)
  const daysLeft = Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft === 2) {
    return upgradeTriggers.trialEnding(daysLeft);
  }
  
  return null;
}