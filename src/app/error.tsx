'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-500">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md text-sm">
          We apologize for the inconvenience. An unexpected error has occurred while loading this segment.
        </p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
