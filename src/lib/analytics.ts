// Enhanced analytics.ts

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
  | 'checkout_started';

interface EventProperties {
  userId?: string;
  email?: string;
  variant?: string;
  amount?: number;
  [key: string]: any;
}

export const analytics = {
  track: async (event: AnalyticsEvent, properties?: EventProperties) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event, properties);
    }
    
    // Save to database
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, properties, timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      // Don't block user experience on analytics failure
      console.error('Analytics error:', err);
    }
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics] Identify:', userId, traits);
    }
  },
};