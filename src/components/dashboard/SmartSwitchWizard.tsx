'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Lock,
  Smartphone,
  Copy,
  ExternalLink
} from 'lucide-react';

interface SmartSwitchWizardProps {
  defaultExchange?: string;
}

export default function SmartSwitchWizard({ defaultExchange = 'binance' }: SmartSwitchWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [exchange, setExchange] = useState(defaultExchange);
  const [uid, setUid] = useState('');
  const [subUid, setSubUid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Mock referral links (In real app, fetch from API)
  const referralLinks: Record<string, string> = {
    binance: 'https://accounts.binance.com/register?ref=APEX_OS',
    bybit: 'https://www.bybit.com/register?promo_code=APEX_OS',
    okx: 'https://www.okx.com/join/APEX_OS',
    // ... others
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;

    setLoading(true);
    try {
      // Get JWT token from cookie or localStorage
      const token = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))?.split('=')[1]
        || localStorage.getItem('apex_token');

      if (!token) {
        setResult({ success: false, message: 'Please log in to verify your account' });
        setLoading(false);
        return;
      }

      // Call API with authentication
      const response = await fetch('/api/v1/user/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exchange,
          user_uid: uid
        }),
      });
      const data = await response.json();

      if (data.success && data.verified) {
        setResult({ success: true, message: data.message || 'Account Verified!' });
        setStep(3); // Skip to success
      } else {
        // If not verified, move to Step 2 (The Switch) with referral link
        setStep(2);
        if (data.referral_link) {
          // Store referral link for Step 2
          (window as any).apexReferralLink = data.referral_link;
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      setResult({ success: false, message: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subUid) return;

    setLoading(true);
    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('sb-access-token='))?.split('=')[1]
        || localStorage.getItem('apex_token');

      if (!token) {
        setResult({ success: false, message: 'Please log in to verify your account' });
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/user/verify-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          exchange,
          user_uid: subUid
        }),
      });
      const data = await response.json();

      if (data.success && data.verified) {
        setResult({ success: true, message: data.message || 'Sub-account Verified!' });
      } else {
        setResult({ success: false, message: data.message || 'Verification failed. Please check UID.' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Apex Smart-Switch
          </h3>
          <div className="flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-colors ${step >= s ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-400">
          {step === 1 && "Check if your account is linked."}
          {step === 2 && "Create a secure sub-account."}
          {step === 3 && "Verify your new sub-account."}
        </p>
      </div>

      {/* Body */}
      <div className="p-6 min-h-[300px]">
        <AnimatePresence mode="wait">

          {/* STEP 1: CHECK STATUS */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleCheckStatus}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Select Exchange</label>
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                >
                  {['binance', 'bybit', 'okx', 'bitget', 'kucoin', 'mexc', 'gate', 'htx', 'bingx', 'phemex', 'coinex', 'bitmart'].map(ex => (
                    <option key={ex} value={ex}>{ex.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current User ID (UID)</label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  placeholder="e.g. 12345678"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !uid}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Check Status'}
              </button>
            </motion.form>
          )}

          {/* STEP 2: THE SWITCH */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex gap-3">
                <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <p className="text-sm text-yellow-200">
                  Your current account is not linked. To enable rebates, please create a sub-account under Apex.
                </p>
              </div>

              <div className="text-center">
                <a
                  href={(window as any).apexReferralLink || referralLinks[exchange] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform"
                >
                  Open Apex Vault <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-xs text-gray-500 mt-3">
                  1. Click to open exchange<br />
                  2. Create a Sub-account<br />
                  3. Copy new UID
                </p>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full border border-white/10 hover:bg-white/5 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                I have my new UID <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEP 3: FINAL VERIFY */}
          {step === 3 && (
            <motion.form
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleFinalVerify}
              className="space-y-4"
            >
              {!result?.success ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Enter New Sub-Account UID</label>
                    <input
                      type="text"
                      value={subUid}
                      onChange={(e) => setSubUid(e.target.value)}
                      placeholder="New UID"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !subUid}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Verify & Activate'}
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h4 className="text-xl font-bold text-white mb-2">Protected by Apex</h4>
                  <p className="text-gray-400">Your rebates are now active.</p>
                </div>
              )}

              {result && !result.success && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                  {result.message}
                </div>
              )}
            </motion.form>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
