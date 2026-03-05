'use client';

import Cookies from 'js-cookie';
import { AlertCircle, ArrowLeft, Key, Loader2, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';

export default function AdminMFALoginPage() {
  const router = useRouter();
  const _searchParams = useSearchParams();

  const [token, setToken] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get temp token and email from sessionStorage (set during login)
  const [tempToken, setTempToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedTempToken = sessionStorage.getItem('mfaTempToken');
    const storedEmail = sessionStorage.getItem('mfaEmail');

    if (!storedTempToken || !storedEmail) {
      // No temp token, redirect to login
      router.push('/admin/login?error=mfa_token_missing');
      return;
    }

    setTempToken(storedTempToken);
    setEmail(storedEmail);
  }, [router]);

  const handleVerify = async () => {
    if (!token || (!useRecovery && token.length !== 6)) {
      setError('Please enter a valid code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify({
          email,
          token,
          useRecoveryCode: useRecovery,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Success! Store session token and redirect
      localStorage.setItem('apex_token', data.sessionToken);

      // Set cookie for middleware
      Cookies.set('sb-access-token', data.sessionToken, { expires: 7, path: '/' });

      sessionStorage.removeItem('mfaTempToken');
      sessionStorage.removeItem('mfaEmail');

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleVerify();
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('mfaTempToken');
    sessionStorage.removeItem('mfaEmail');
    router.push('/admin/login');
  };

  if (!tempToken || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-400 text-sm">Enter the code from your authenticator app</p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 space-y-6">
          {/* Email Display */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Logging in as</p>
            <p className="text-sm font-medium text-white">{email}</p>
          </div>

          {/* Toggle between TOTP and Recovery Code */}
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setUseRecovery(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !useRecovery ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Key className="w-4 h-4 inline mr-1" />
              Authenticator
            </button>
            <button
              onClick={() => {
                setUseRecovery(true);
                setToken('');
              }}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                useRecovery ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Recovery Code
            </button>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              {useRecovery ? 'Recovery Code' : '6-Digit Code'}
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => {
                const value = useRecovery
                  ? e.target.value.toUpperCase()
                  : e.target.value.replace(/\D/g, '').substring(0, 6);
                setToken(value);
              }}
              onKeyPress={handleKeyPress}
              className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-emerald-500"
              placeholder={useRecovery ? 'XXXX-XXXX' : '000000'}
              maxLength={useRecovery ? 9 : 6}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || !token || (!useRecovery && token.length !== 6)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Login'
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-4">
          <button
            onClick={handleBackToLogin}
            className="text-gray-500 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
