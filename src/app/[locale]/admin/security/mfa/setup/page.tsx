'use client';

import { AlertTriangle, ArrowRight, CheckCircle, Loader2, Shield, Smartphone } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function MFASetupPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'success'>('loading');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchMFASecret = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/security/mfa/setup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('scan');
      } else {
        setError(data.message || 'Failed to generate MFA secret');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchMFASecret();
    }
  }, [token, fetchMFASecret]);

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/v1/admin/security/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          router.push('/admin');
        }, 3000);
      } else {
        setError(data.message || 'Invalid code. Please try again.');
      }
    } catch (_err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Secure Your Account</h1>
            <p className="text-sm text-zinc-400">Multi-Factor Authentication Setup</p>
          </div>
        </div>

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
            <p className="text-zinc-400">Generating security keys...</p>
          </div>
        )}

        {step === 'scan' && (
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
              <div className="bg-white p-2 rounded-lg inline-block mb-4">
                {qrCode && <Image src={qrCode} alt="MFA QR Code" width={192} height={192} className="h-48 w-48" />}
              </div>
              <p className="text-sm text-gray-300 mb-2">
                Scan this QR code with your authenticator app
                <br />
                (Google Authenticator, Authy, etc.)
              </p>
              <div className="text-xs font-mono text-zinc-500 bg-black/50 p-2 rounded break-all">Secret: {secret}</div>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="h-16 w-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium">Enter Verification Code</h3>
              <p className="text-sm text-zinc-400">Enter the 6-digit code from your authenticator app</p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('scan')}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">MFA Enabled!</h2>
            <p className="text-zinc-400 mb-8">Your account is now secured with two-factor authentication.</p>
            <p className="text-sm text-zinc-500">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}
