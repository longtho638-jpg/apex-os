"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ChevronRight, Check, AlertCircle, RefreshCw,
  ExternalLink, QrCode, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';

type Exchange = 'binance' | 'bybit' | 'okx';
type Step = 1 | 2 | 3;
type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'failed' | 'manual_review';

interface VerificationResult {
  verified: boolean;
  status: string;
  message: string;
  metadata?: {
    referral_link?: string;
    fraud_signals?: string[];
  };
}

const EXCHANGE_INFO = {
  binance: {
    name: 'Binance',
    color: '#F3BA2F',
    uidPattern: /^\d{9}$/,
    uidPlaceholder: '123456789 (9 digits)',
    referralLink: 'https://www.binance.com/en/register?ref=APEX_XXXX'
  },
  bybit: {
    name: 'Bybit',
    color: '#F7A600',
    uidPattern: /^\d{6,9}$/,
    uidPlaceholder: '12345678 (6-9 digits)',
    referralLink: 'https://www.bybit.com/register?affiliate_id=APEX_XXXX'
  },
  okx: {
    name: 'OKX',
    color: '#000000',
    uidPattern: /^[a-zA-Z0-9-]{6,20}$/,
    uidPlaceholder: 'OKX-12345-ABCDE',
    referralLink: 'https://www.okx.com/join/APEX_XXXX'
  }
};

export default function SmartSwitchWizard() {
  const [step, setStep] = useState<Step>(1);
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [uid, setUid] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fireConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        },
        colors: ['#00FF00', '#00DD00', '#00BB00']
      });
    }, 250);
  };

  const validateUID = (input: string): boolean => {
    if (!selectedExchange) return false;
    return EXCHANGE_INFO[selectedExchange].uidPattern.test(input.trim());
  };

  const handleVerify = async () => {
    if (!selectedExchange || !uid) return;

    if (!validateUID(uid)) {
      setError(`Invalid UID format for ${EXCHANGE_INFO[selectedExchange].name}`);
      return;
    }

    setStatus('verifying');
    setError(null);

    try {
      const response = await fetch('/api/v1/verify-subaccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exchange: selectedExchange,
          user_uid: uid.trim()
        })
      });

      const data: VerificationResult = await response.json();

      if (response.ok && data.verified) {
        setStatus('verified');
        setResult(data);
        setStep(3);
        setTimeout(() => fireConfetti(), 300);
      } else {
        setStatus('failed');
        setResult(data);
        setRetryCount(prev => prev + 1);
        setStep(3);
      }
    } catch (err) {
      setStatus('failed');
      setError('Network error. Please try again.');
      setResult({
        verified: false,
        status: 'failed',
        message: 'Failed to connect to verification service'
      });
      setStep(3);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedExchange(null);
    setUid('');
    setStatus('idle');
    setResult(null);
    setError(null);
  };

  const handleRetry = () => {
    setStep(2);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="rounded-xl border border-[#00FF00]/30 bg-[#00FF00]/5 p-8 relative overflow-hidden group">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF00]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00FF00]/20 transition-all duration-500" />
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,255,0,0.03)_10px,rgba(0,255,0,0.03)_20px)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/20">
            <Zap className="h-6 w-6 text-[#00FF00]" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono">APEX_SMART_SWITCH</h3>
            <p className="text-xs text-gray-500 font-mono">SUB_ACCOUNT_VERIFICATION_v2.0</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 font-mono text-sm transition-all",
                  step >= s
                    ? "bg-[#00FF00]/20 border-[#00FF00] text-[#00FF00]"
                    : "border-gray-700 text-gray-500"
                )}
              >
                {s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "flex-1 h-[2px] transition-all",
                  step > s ? "bg-[#00FF00]" : "bg-gray-700"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Exchange Selection */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-lg font-semibold mb-2">Select Exchange</h4>
                <p className="text-sm text-gray-400 mb-4">
                  Choose the exchange where you want to verify your sub-account
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['binance', 'bybit', 'okx'] as Exchange[]).map((ex) => (
                  <button
                    key={ex}
                    onClick={() => {
                      setSelectedExchange(ex);
                      setStep(2);
                    }}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all duration-300",
                      "hover:scale-105 hover:border-[#00FF00]/50",
                      "bg-gradient-to-br from-gray-900/50 to-gray-800/30",
                      "border-gray-700 hover:bg-gray-800/50"
                    )}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono mb-2">
                        {EXCHANGE_INFO[ex].name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        EXCHANGE_NODE_{ex.toUpperCase()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: UID Input */}
          {step === 2 && selectedExchange && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <h4 className="text-lg font-semibold mb-2">
                  Enter Your {EXCHANGE_INFO[selectedExchange].name} UID
                </h4>
                <p className="text-sm text-gray-400 mb-4">
                  Your unique identifier on {EXCHANGE_INFO[selectedExchange].name}
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => {
                    setUid(e.target.value);
                    setError(null);
                  }}
                  placeholder={EXCHANGE_INFO[selectedExchange].uidPlaceholder}
                  disabled={status === 'verifying'}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg bg-gray-900/50 border-2",
                    "font-mono text-[#00FF00] placeholder:text-gray-600",
                    "focus:outline-none focus:border-[#00FF00]/50 transition-all",
                    error ? "border-red-500/50" : "border-gray-700",
                    status === 'verifying' && "opacity-50 cursor-not-allowed"
                  )}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStep(1);
                      setUid('');
                      setError(null);
                    }}
                    disabled={status === 'verifying'}
                    className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleVerify}
                    disabled={!uid || status === 'verifying'}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-lg font-semibold transition-all",
                      "bg-[#00FF00]/20 border-2 border-[#00FF00]/50",
                      "hover:bg-[#00FF00]/30 hover:border-[#00FF00]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "flex items-center justify-center gap-2"
                    )}
                  >
                    {status === 'verifying' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Success */}
              {status === 'verified' && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#00FF00]/20 border-2 border-[#00FF00] mb-4">
                    <Check className="h-10 w-10 text-[#00FF00]" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-[#00FF00] mb-2">
                      Verified!
                    </h4>
                    <p className="text-gray-400">
                      {result.message}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[#00FF00] text-sm font-mono">
                    <Sparkles className="h-4 w-4" />
                    <span>REBATE_TRACKING_ENABLED</span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="mt-4 px-6 py-2 rounded-lg border border-gray-700 hover:border-[#00FF00]/50 transition-all"
                  >
                    Verify Another Account
                  </button>
                </div>
              )}

              {/* Failed */}
              {status === 'failed' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 mb-4">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-red-400 mb-2">
                      Verification Failed
                    </h4>
                    <p className="text-gray-400 mb-4">
                      {result.message}
                    </p>
                  </div>

                  {/* Show QR Code and Referral Link */}
                  {selectedExchange && (
                    <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-4">
                          Create a sub-account under Apex referral:
                        </p>
                        <div className="flex justify-center mb-4">
                          <div className="bg-white p-4 rounded-lg">
                            <QRCodeSVG
                              value={EXCHANGE_INFO[selectedExchange].referralLink}
                              size={200}
                              level="H"
                            />
                          </div>
                        </div>
                        <a
                          href={EXCHANGE_INFO[selectedExchange].referralLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF00]/20 border border-[#00FF00]/50 hover:bg-[#00FF00]/30 transition-all text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open {EXCHANGE_INFO[selectedExchange].name}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
                    >
                      Start Over
                    </button>
                    <button
                      onClick={handleRetry}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#00FF00]/20 border border-[#00FF00]/50 hover:bg-[#00FF00]/30 transition-all"
                    >
                      Try Again
                    </button>
                  </div>

                  {retryCount > 2 && (
                    <div className="text-center text-xs text-gray-500 font-mono">
                      Having trouble? Contact support for manual verification
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
