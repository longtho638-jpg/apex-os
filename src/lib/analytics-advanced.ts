import { analytics, AnalyticsEvent } from '@/lib/analytics';

function trackEvent(event: AnalyticsEvent, metadata: any) {
  analytics.track(event, metadata);
}

// Session tracking
export const sessionTracking = {
  startSession: () => {
    if (typeof window === 'undefined') return;
    const sessionStart = Date.now();
    sessionStorage.setItem('session_start', sessionStart.toString());
  },

  trackPageView: (page: string) => {
    if (typeof window === 'undefined') return;
    const sessionStart = parseInt(sessionStorage.getItem('session_start') || '0');
    const timeOnPage = Date.now() - sessionStart;
    
    trackEvent('page_view', {
        page,
        time_on_page_ms: timeOnPage,
        session_id: sessionStorage.getItem('session_id') || generateSessionId(),
    });
  },

  trackExit: (page: string) => {
    if (typeof window === 'undefined') return;
    trackEvent('exit_intent', {
        page,
        time_on_site: Date.now() - parseInt(sessionStorage.getItem('session_start') || '0'),
    });
  },
};

// Feature usage tracking
export const featureTracking = {
  signalViewed: (signalId: string) => {
    trackEvent('feature_used_signal_view', { signal_id: signalId });
  },

  tradeExecuted: (amount: number, symbol: string) => {
    trackEvent('feature_used_trade_execute', { amount, symbol });
  },

  alertCreated: (type: string) => {
    trackEvent('feature_used_alert_create', { alert_type: type });
  },
};

// Error tracking
export const errorTracking = {
  apiError: (endpoint: string, errorCode: number) => {
    trackEvent('error_encountered', {
        error_type: 'api_error',
        endpoint,
        error_code: errorCode,
        severity: errorCode >= 500 ? 'high' : 'medium',
    });
  },

  paymentFailed: (reason: string) => {
    trackEvent('error_encountered', {
        error_type: 'payment_failed',
        reason,
        severity: 'high',
    });
  },
};

function generateSessionId() {
  if (typeof window === 'undefined') return `session_${Date.now()}`;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('session_id', sessionId);
  return sessionId;
}
