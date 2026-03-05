'use client';

import { ShieldCheck } from 'lucide-react';
import { useExchangeAccounts } from '@/hooks/useExchangeAccounts';
import { ExchangeLinkAccountForm } from './exchange/ExchangeLinkAccountForm';
import { LinkedAccountsList } from './exchange/LinkedAccountsList';

export default function ExchangeLinkingManager() {
  const { linkedAccounts, loading, addAccount, deleteAccount } = useExchangeAccounts();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Exchange Connections
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Link your exchange accounts to enable automatic fee rebates and portfolio tracking.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <ExchangeLinkAccountForm onAddAccount={addAccount} existingAccounts={linkedAccounts} />

        <LinkedAccountsList accounts={linkedAccounts} loading={loading} onDelete={deleteAccount} />
      </div>
    </div>
  );
}
