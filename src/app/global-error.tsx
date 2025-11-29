'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex items-center justify-center min-h-screen bg-[#030303] text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong!</h1>
                <p className="text-zinc-400 mb-6">Our team has been notified.</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-emerald-500 rounded-lg font-bold hover:bg-emerald-600"
                >
                    Reload Page
                </button>
            </div>
        </div>
      </body>
    </html>
  );
}
