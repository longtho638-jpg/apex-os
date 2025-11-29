'use client';

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export interface FilterState {
  symbols: string[];
  timeframe: string;
  minConfidence: number;
}

interface SignalFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
}

export function SignalFilters({ filters, onChange }: SignalFiltersProps) {
  const t = useTranslations('DashboardComponents.SignalFilters');
  const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB'];
  const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h'];

  const toggleSymbol = (sym: string) => {
    const newSymbols = filters.symbols.includes(sym)
      ? filters.symbols.filter(s => s !== sym)
      : [...filters.symbols, sym];
    onChange({ ...filters, symbols: newSymbols });
  };

  return (
    <div className="w-full lg:w-64 bg-[#0A0A0A] border-r border-white/5 p-6 flex flex-col gap-8 h-full">
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Filter size={12} /> {t('assets')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.map(sym => (
            <button
              key={sym}
              onClick={() => toggleSymbol(sym)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filters.symbols.includes(sym)
                ? 'bg-emerald-500 text-black'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">{t('timeframe')}</h3>
        <div className="grid grid-cols-3 gap-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => onChange({ ...filters, timeframe: tf })}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${filters.timeframe === tf
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-transparent'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex justify-between">
          {t('min_confidence')} <span className="text-white">{filters.minConfidence}%</span>
        </h3>
        <input
          type="range"
          min="0"
          max="100"
          value={filters.minConfidence}
          onChange={(e) => onChange({ ...filters, minConfidence: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={() => onChange({ symbols: [], timeframe: '1h', minConfidence: 0 })}
          className="w-full py-2 text-xs text-zinc-500 hover:text-white flex items-center justify-center gap-2 transition-colors"
        >
          <X size={12} /> {t('reset')}
        </button>
      </div>
    </div>
  );
}
