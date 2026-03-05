'use client';

import { useState } from 'react';
import ConnectExchange from '@/components/dashboard/ConnectExchange';
import SmartSwitchWizard from '@/components/dashboard/SmartSwitchWizard';
import ZenWidget from '@/components/dashboard/ZenWidget';

export default function TradingPage() {
  const [view, setView] = useState<'setup' | 'automation'>('setup');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Trading</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('setup')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'setup' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-400'
            }`}
          >
            Exchange Setup
          </button>
          <button
            onClick={() => setView('automation')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'automation' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-400'
            }`}
          >
            Automation
          </button>
        </div>
      </div>

      {view === 'setup' ? (
        <div className="space-y-6">
          <ConnectExchange />
          <SmartSwitchWizard />
        </div>
      ) : (
        <ZenWidget />
      )}
    </div>
  );
}
