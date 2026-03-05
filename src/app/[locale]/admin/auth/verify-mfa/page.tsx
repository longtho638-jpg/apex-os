'use client';

import { Key, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

interface MFAVerifyPageProps {
  searchParams: { email?: string };
}

export default function MFAVerifyPage({ searchParams }: MFAVerifyPageProps) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.email || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/auth/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: token.trim(),
          isRecoveryCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // In real app, set session cookie here
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold">Two-Factor Authentication</h2>
        </div>
        <p className="text-sm text-muted-foreground">Enter the code from your authenticator app</p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {isRecoveryCode ? 'Recovery Code' : '6-Digit Code'}
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={isRecoveryCode ? 'XXXX-XXXX-XXXX' : '000000'}
              maxLength={isRecoveryCode ? 14 : 6}
            />
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

          <Button type="submit" disabled={loading || !token || token.length < 6} className="w-full" size="lg">
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setIsRecoveryCode(!isRecoveryCode);
              setToken('');
              setError(null);
            }}
            className="w-full text-sm text-blue-600 hover:underline"
          >
            {isRecoveryCode ? (
              <>
                <Key className="w-4 h-4 inline mr-1" />
                Use authenticator code instead
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 inline mr-1" />
                Use recovery code instead
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="text-sm text-muted-foreground hover:underline"
            >
              Back to login
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
