'use client';

import { Filter, X } from 'lucide-react';
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
  const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'PEPE', 'WIF', 'SUI', 'NEAR', 'APT', 'FET'];
  const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];

  const toggleSymbol = (sym: string) => {
    const newSymbols = filters.symbols.includes(sym)
      ? filters.symbols.filter((s) => s !== sym)
      : [...filters.symbols, sym];
    onChange({ ...filters, symbols: newSymbols });
  };

  return (
    <div className="flex flex-col h-full">
      {/* FILTERS (Compact Mode for 200px width) */}
      <div className="flex-1 space-y-6 p-3">
        {/* Assets */}
        <div>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Filter size={10} /> {t('assets')}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {SYMBOLS.map((sym) => (
              <button
                key={sym}
                onClick={() => toggleSymbol(sym)}
                className={`px-1 py-1 rounded text-[9px] font-bold transition-all border text-center ${
                  filters.symbols.includes(sym)
                    ? 'bg-emerald-500 text-black border-emerald-500'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/5'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">{t('timeframe')}</h3>
          <div className="grid grid-cols-4 gap-1.5">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onChange({ ...filters, timeframe: tf })}
                className={`px-1 py-1 rounded text-[9px] font-medium transition-all border text-center ${
                  filters.timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 border-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Confidence */}
        <div>
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3 flex justify-between">
            {t('min_confidence')} <span className="text-emerald-400 font-mono">{filters.minConfidence}%</span>
          </h3>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={filters.minConfidence}
            onChange={(e) => onChange({ ...filters, minConfidence: parseInt(e.target.value, 10) })}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="pt-2 border-t border-white/5">
          <button
            onClick={() => onChange({ symbols: [], timeframe: '1m', minConfidence: 0 })}
            className="w-full py-1.5 text-[10px] text-zinc-500 hover:text-white flex items-center justify-center gap-2 transition-colors hover:bg-white/5 rounded-lg"
          >
            <X size={10} /> {t('reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
