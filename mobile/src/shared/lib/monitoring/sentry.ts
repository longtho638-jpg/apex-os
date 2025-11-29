import * as Sentry from '@sentry/nextjs';

export const initSentry = () => {
    // Sentry is initialized via sentry.*.config.ts files in Next.js
    // This function can be used for manual initialization if needed, 
    // but usually not required with the Next.js SDK.
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
        console.warn('Sentry DSN not found in production environment.');
    }
};

export const captureError = (error: Error, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
        console.error('Captured Error:', error, context);
    }

    Sentry.captureException(error, { extra: context });
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' | 'fatal' | 'debug' = 'info') => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${level.toUpperCase()}] ${message}`);
    }

    Sentry.captureMessage(message, level);
};

export const setUserContext = (userId: string, email?: string) => {
    Sentry.setUser({
        id: userId,
        email: email,
    });
};