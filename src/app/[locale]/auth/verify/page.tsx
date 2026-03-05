'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { getSupabaseClientSide } from '@/lib/supabase';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseClientSide();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type') as any; // 'recovery' | 'signup' | 'magiclink'
      const email = searchParams.get('email');
      const next = searchParams.get('next') || '/dashboard';

      if (!token || !type) {
        setError('Invalid verification link');
        return;
      }

      try {
        let error;

        // If token is long, it's likely a hash/link token -> use token_hash
        if (token.length > 6) {
          const res = await supabase.auth.verifyOtp({
            token_hash: token,
            type,
          });
          error = res.error;
        } else {
          // If token is short (6 digits), it's an OTP -> use token + email
          const res = await supabase.auth.verifyOtp({
            token,
            type,
            email: email as string,
          });
          error = res.error;
        }

        if (error) {
          logger.error('Verification error:', error);
          setError(error.message);
        } else {
          toast.success('Verification successful');
          router.push(next);
        }
      } catch (err) {
        logger.error('Verification exception:', err);
        setError('An unexpected error occurred');
      }
    };

    verifyToken();
  }, [router, searchParams, supabase]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="max-w-md w-full bg-[#111] border border-red-900/50 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Verification Failed</h2>
          <p className="text-gray-400 mb-6">{error}</p>

          {/* Debug Info */}
          <div className="bg-black/50 p-4 rounded-lg text-left text-xs font-mono text-gray-500 mb-6 overflow-hidden break-all">
            <p>
              <strong>Token:</strong> {searchParams.get('token')?.substring(0, 10)}...
            </p>
            <p>
              <strong>Type:</strong> {searchParams.get('type')}
            </p>
            <p>
              <strong>Email:</strong> {searchParams.get('email')}
            </p>
          </div>

          <button
            onClick={() => router.push('/en/forgot-password')}
            className="w-full bg-[#00FF94] text-black font-bold py-3 rounded-lg hover:bg-[#00cc76] transition-colors"
          >
            Request New Link
          </button>
          <button
            onClick={() => router.push('/en/login')}
            className="mt-4 text-sm text-gray-500 hover:text-white transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF94]" />
        <p className="text-gray-400">Verifying your identity...</p>
      </div>
    </div>
  );
}
