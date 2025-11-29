import posthog from 'posthog-js';

// Initialize PostHog only on the client side
if (typeof window !== 'undefined') {
  const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: 'identified_only', // Privacy friendly
      capture_pageview: false, // We handle this manually in app router if needed, or let it auto for now
      // Autocapture is nice for low-code setup
    });
  }
}

export const ph = posthog;
