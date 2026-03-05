'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to Sentry
    logger.error('Page error occurred', error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 text-white">
      <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-500">Something went wrong!</h2>
        <p className="mb-6 text-slate-400">We've been notified and are working on a fix.</p>
        <p className="mb-6 text-xs text-slate-600 font-mono">Error ID: {error.digest || 'Unknown'}</p>
        <button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          className="rounded bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
