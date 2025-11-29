'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { ShieldCheck, Smartphone, Loader2 } from 'lucide-react';
import Image from 'next/image';

export function TwoFactorSetup({ userId }: { userId: string }) {
  const [step, setStep] = useState<'init' | 'scan' | 'verify'>('init');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startSetup = async () => {
    setLoading(true);
    const res = await fetch('/api/user/2fa/setup', {
        method: 'POST',
        body: JSON.stringify({ userId })
    });
    const data = await res.json();
    
    if (data.qrCode) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('scan');
    }
    setLoading(false);
  };

  const verifyToken = async () => {
    setLoading(true);
    setError('');
    const res = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ userId, token })
    });
    const data = await res.json();

    if (data.success) {
        setStep('verify'); // Success state
    } else {
        setError(data.error || 'Invalid code');
    }
    setLoading(false);
  };

  return (
    <GlassCard className="p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
      </div>

      {step === 'init' && (
        <div className="text-center">
            <p className="text-zinc-400 mb-6">
                Secure your account with Google Authenticator.
            </p>
            <button 
                onClick={startSetup}
                disabled={loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Smartphone className="w-4 h-4" />}
                Enable 2FA
            </button>
        </div>
      )}

      {step === 'scan' && (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg w-fit mx-auto">
                {qrCode && <Image src={qrCode} alt="2FA QR" width={150} height={150} />}
            </div>
            <p className="text-xs text-center text-zinc-500 font-mono break-all">
                Secret: {secret}
            </p>
            
            <div className="space-y-2">
                <label className="text-sm text-zinc-400">Enter 6-digit Code</label>
                <input 
                    type="text" 
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2 text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button 
                onClick={verifyToken}
                disabled={token.length !== 6 || loading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg font-bold"
            >
                {loading ? 'Verifying...' : 'Verify & Activate'}
            </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="text-center py-4">
            <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400 mb-2">2FA Enabled</h3>
            <p className="text-zinc-400">Your account is now protected.</p>
        </div>
      )}
    </GlassCard>
  );
}
