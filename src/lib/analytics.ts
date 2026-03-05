import { logger } from '@/lib/logger';
import { ph } from '@/lib/posthog';

export type AnalyticsEvent =
  | 'landing_page_view'
  | 'view_pricing_click'
  | 'start_trial_click'
  | 'pricing_page_view'
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'
  | 'payment_started'
  | 'payment_completed'
  | 'page_view'
  | 'exit_intent'
  | 'feature_used_signal_view'
  | 'feature_used_trade_execute'
  | 'feature_used_alert_create'
  | 'error_encountered'
  | 'upgrade_trigger_shown'
  | 'checkout_started'
  | 'usage_charge_created'
  | 'onboarding_completed'
  | 'pricing_modal_upgrade_clicked'
  | 'pricing_modal_viewed'
  | 'ai_request_completed';

interface EventProperties {
  userId?: string;
  email?: string;
  variant?: string;
  amount?: number;
  [key: string]: any;
}

export const analytics = {
  track: async (event: AnalyticsEvent, properties?: EventProperties) => {
    // 1. Send to PostHog (Client-side)
    if (typeof window !== 'undefined') {
      ph.capture(event, properties);
    }

    // 2. Double-write to our Database (via API)
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      logger.error('Internal Analytics error:', err);
    }
  },

  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined') {
      ph.identify(userId, traits);
    }
  },
};
