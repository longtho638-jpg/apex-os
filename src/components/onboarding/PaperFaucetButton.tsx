'use client';

/**
 * Paper Faucet Button
 *
 * Allows users to claim paper trading funds
 */

import { DollarSign, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export function PaperFaucetButton() {
  const t = useTranslations('trading.paper');
  const [loading, setLoading] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/paper/faucet', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('faucetError', { defaultValue: 'Failed to claim funds' }));
        return;
      }

      toast.success(
        t('faucetSuccess', {
          defaultValue: `Added $${data.amount.toLocaleString()}! New balance: $${data.newBalance.toLocaleString()}`,
        }),
      );
    } catch (_error) {
      toast.error(t('faucetError', { defaultValue: 'Failed to claim funds' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClaim}
      disabled={loading}
      data-tour="paper-faucet"
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {t('claiming', { defaultValue: 'Claiming...' })}
        </>
      ) : (
        <>
          <DollarSign className="w-4 h-4" />
          {t('addFunds', { defaultValue: 'Add $10k Paper Funds' })}
        </>
      )}
    </button>
  );
}
