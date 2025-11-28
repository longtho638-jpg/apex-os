# Sentry Setup Guide

## Overview
This project uses Sentry for real-time error tracking and performance monitoring.

## Configuration
Sentry is configured in the following files:
- `sentry.client.config.ts`: Client-side configuration
- `sentry.server.config.ts`: Server-side configuration
- `sentry.edge.config.ts`: Edge runtime configuration

## Environment Variables
The following environment variables are required in `.env.local` (and production env):

```bash
# Sentry DSN (Data Source Name)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxx@xxx.ingest.sentry.io/xxxxxxx

# Optional: Auth Token for source map uploads during build
SENTRY_AUTH_TOKEN=xxx
```

## Usage in Code
Use the helper functions in `src/lib/monitoring/sentry.ts` to manually capture errors or messages.

```typescript
import { captureError, captureMessage } from '@/lib/monitoring/sentry';

try {
  // ... code
} catch (error) {
  captureError(error, { context: 'payment_processing' });
}

captureMessage('User reached milestone', 'info');
```

## Error Boundary
A global React Error Boundary is implemented in `src/app/[locale]/error.tsx`. It automatically catches unhandled rendering errors and reports them to Sentry.

## Verification
To verify the setup:
1. Ensure `NEXT_PUBLIC_SENTRY_DSN` is set.
2. Run the app in dev mode or build for production.
3. Trigger an error (e.g., throw new Error('Test Sentry')).
4. Check the Sentry dashboard.
