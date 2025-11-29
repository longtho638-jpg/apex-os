/**
 * Mock Analytics Service
 * 
 * TECHNICAL DEBT: This is a temporary mock implementation.
 * TODO: Replace with production analytics (PostHog, Mixpanel, or similar)
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
        console.log('[Analytics Mock]', event);
    }

    // TODO: In production, this should call actual analytics service:
    // - PostHog: posthog.capture(event.event_name, event.metadata)
    // - Mixpanel: mixpanel.track(event.event_name, event.metadata)
    // - Custom: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) })
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
        console.log('[Analytics Mock] Identify:', userId, traits);
    }

    // TODO: In production: analytics.identify(userId, traits)
}
