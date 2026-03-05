'use client';

import { AlertCircle, CheckCircle2, Copy, Download, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';

interface MFASetupWizardProps {
  email: string;
  onComplete: () => void;
  onCancel?: () => void;
}

type Step = 'setup' | 'verify' | 'recovery' | 'complete';

export default function MFASetupWizard({ email, onComplete, onCancel }: MFASetupWizardProps) {
  const [step, setStep] = useState<Step>('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA Setup Data
  const [secret, setSecret] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Step 1: Setup - Generate MFA Secret
  const handleSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Setup failed');
      }

      setSecret(data.data.secret);
      setQrCodeDataUrl(data.data.qrCodeDataUrl);
      setRecoveryCodes(data.data.recoveryCodes);
      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verification
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/admin/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token: verificationCode,
          useRecoveryCode: false,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setStep('recovery');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Download Recovery Codes
  const handleDownloadRecoveryCodes = () => {
    const codesText = recoveryCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mfa-recovery-codes-${email}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setStep('complete');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication Setup</h2>
        <p className="text-gray-400 text-sm">Secure your admin account with MFA</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'setup' || step === 'verify' || step === 'recovery' || step === 'complete'
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-gray-500'
          }`}
        >
          1
        </div>
        <div
          className={`w-12 h-0.5 ${
            step === 'verify' || step === 'recovery' || step === 'complete' ? 'bg-emerald-500' : 'bg-white/10'
          }`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'verify' || step === 'recovery' || step === 'complete'
              ? 'bg-emerald-500 text-white'
              : 'bg-white/10 text-gray-500'
          }`}
        >
          2
        </div>
        <div
          className={`w-12 h-0.5 ${step === 'recovery' || step === 'complete' ? 'bg-emerald-500' : 'bg-white/10'}`}
        />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === 'recovery' || step === 'complete' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-500'
          }`}
        >
          3
        </div>
      </div>

      {/* Content */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8">
        {/* Step 1: Setup */}
        {step === 'setup' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Started</h3>
              <p className="text-gray-400 text-sm">
                We'll generate a unique QR code for your Google Authenticator or Authy app.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleSetup}
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate QR Code'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Scan QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCodeDataUrl} alt="MFA QR Code" className="w-64 h-64" />
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-2">Or enter this secret manually:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-xs font-mono text-white">
                  {secret}
                </code>
                <button
                  onClick={handleCopySecret}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Enter 6-digit code from your app:</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-emerald-500"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>
        )}

        {/* Step 3: Recovery Codes */}
        {step === 'recovery' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Save Recovery Codes</h3>
              <p className="text-gray-400 text-sm">
                Store these codes in a safe place. You can use them to access your account if you lose your device.
              </p>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono text-emerald-400 bg-black/50 px-3 py-2 rounded">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownloadRecoveryCodes}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Codes & Complete Setup
            </button>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">MFA Enabled Successfully!</h3>
              <p className="text-gray-400 text-sm">Your account is now protected with two-factor authentication.</p>
            </div>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Cancel Button (only show in setup step) */}
      {step === 'setup' && onCancel && (
        <div className="text-center mt-4">
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
            Skip for now
          </button>
        </div>
      )}
    </div>
  );
}
