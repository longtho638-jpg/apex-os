'use client';

import { AlertTriangle, ArrowRight, CheckCircle, DollarSign } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function WithdrawalPanel() {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ status: string; message: string } | null>(null);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/v1/admin/finance/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user?.id,
          amount: parseFloat(amount),
          destinationAddress: address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ status: data.status, message: data.message });
        if (data.status === 'COMPLETED') {
          setAmount('');
          setAddress('');
        }
      } else {
        setResult({ status: 'ERROR', message: data.error || 'Failed to process' });
      }
    } catch (_error) {
      setResult({ status: 'ERROR', message: 'Network error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-[#00FF94]/20 flex items-center justify-center border border-[#00FF94]/30">
          <DollarSign className="h-5 w-5 text-[#00FF94]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Treasury Withdrawal</h3>
          <p className="text-sm text-gray-400">Transfer funds to external wallet</p>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Amount (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FF94]/50 focus:outline-none font-mono text-lg"
            placeholder="0.00"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Note: Amounts &ge; $10,000 require Multi-Sig approval.</p>
        </div>

        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider mb-1 block">Destination Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#00FF94]/50 focus:outline-none font-mono text-sm"
            placeholder="0x..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#00FF94] text-black font-bold py-3 rounded-lg hover:bg-[#00CC76] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            'Processing...'
          ) : (
            <>
              <span>Initiate Transfer</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg border flex items-start gap-3 ${
            result.status === 'REQUIRES_APPROVAL'
              ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
              : result.status === 'COMPLETED'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {result.status === 'REQUIRES_APPROVAL' ? (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          ) : result.status === 'COMPLETED' ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {result.status === 'REQUIRES_APPROVAL' ? 'Approval Required' : result.status}
            </div>
            <div className="text-xs opacity-80">{result.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
