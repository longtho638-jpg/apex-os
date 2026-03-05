import { logger } from '@/lib/logger';

/**
 * Mock Analytics Service
 *
 * Temporary mock implementation. Replace with production analytics provider
 * (PostHog, Mixpanel, or similar) when analytics requirements are defined.
 *
 * Usage:
 * import { trackEvent } from '@/lib/analytics-mock';
 * trackEvent({ event_name: 'button_clicked', metadata: { ... } });
 */

interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

/**
 * Mock event tracking for development
 * Logs to console in development, no-op in production
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === 'development') {
    logger.info('[Analytics Mock]', event);
  }

  // Production: integrate posthog.capture(event.event_name, event.metadata) or equivalent
}

/**
 * Mock page view tracking
 */
export function trackPageView(page: string, metadata?: Record<string, any>): void {
  trackEvent({
    event_name: 'page_view',
    metadata: { page, ...metadata },
  });
}

/**
 * Mock user identification
 */
export function identifyUser(userId: string, traits?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    logger.info('[Analytics Mock] Identify', { userId, traits });
  }

  // Production: integrate analytics.identify(userId, traits)
}
