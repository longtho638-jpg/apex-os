'use client';

/**
 * Withdrawal Request Modal
 *
 * Allows users to request withdrawals from their wallet
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  currency?: string;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  availableBalance,
  currency = 'USD',
}: WithdrawalModalProps) {
  const t = useTranslations('payments.withdrawal');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'crypto'>('bank');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      toast.error(t('errorInvalidAmount', { defaultValue: 'Invalid amount' }));
      return;
    }

    if (withdrawalAmount > availableBalance) {
      toast.error(t('errorInsufficientFunds', { defaultValue: 'Insufficient funds' }));
      return;
    }

    if (!destination.trim()) {
      toast.error(
        t('errorDestination', { defaultValue: 'Please provide withdrawal destination' })
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/payments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: withdrawalAmount,
          currency,
          method,
          destination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('errorGeneric', { defaultValue: 'Withdrawal failed' }));
        return;
      }

      toast.success(
        t('success', {
          defaultValue: `Withdrawal request submitted. Reference: ${data.referenceId}`,
        })
      );
      onClose();
    } catch (error) {
      toast.error(t('errorGeneric', { defaultValue: 'Withdrawal failed' }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('title', { defaultValue: 'Withdraw Funds' })}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Available Balance */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <span className="font-medium">
                {t('available', { defaultValue: 'Available' })}:
              </span>{' '}
              ${availableBalance.toLocaleString()} {currency}
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('amount', { defaultValue: 'Amount' })}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              max={availableBalance}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              required
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('method', { defaultValue: 'Withdrawal Method' })}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  method === 'bank'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t('bank', { defaultValue: 'Bank Transfer' })}
              </button>
              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                  method === 'crypto'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {t('crypto', { defaultValue: 'Crypto' })}
              </button>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {method === 'bank'
                ? t('bankAccount', { defaultValue: 'Bank Account' })
                : t('walletAddress', { defaultValue: 'Wallet Address' })}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={
                method === 'bank' ? 'Account number or IBAN' : '0x...'
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              required
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-900 dark:text-yellow-100">
              {t('warning', {
                defaultValue:
                  'Withdrawals are processed within 1-3 business days. Ensure your details are correct.',
              })}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading
              ? t('submitting', { defaultValue: 'Submitting...' })
              : t('submit', { defaultValue: 'Submit Withdrawal' })}
          </button>
        </form>
      </div>
    </div>
  );
}
