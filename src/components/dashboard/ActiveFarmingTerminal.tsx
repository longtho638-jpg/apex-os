'use client';

import { useState, useEffect, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Play, Pause, Terminal as TerminalIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export function ActiveFarmingTerminal() {
  const t = useTranslations('DashboardComponents.ActiveFarming');
  const [active, setActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const actions = [
        `${t('log_executing')} BUY BTC/USDT @ 64200...`,
        `${t('log_harvested')}: +$0.42 (Binance)`,
        t('log_rebalancing'),
        t('log_scanning'),
        `${t('log_executing')} SELL BTC/USDT @ 64350...`,
        `${t('log_harvested')}: +$0.15 (OKX)`,
      ];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toLocaleTimeString();

      setLogs(prev => [`[${timestamp}] ${action}`, ...prev].slice(0, 50));
    }, 1500);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <TerminalIcon className="w-5 h-5 text-emerald-400" /> {t('title')}
        </h3>
        <button
          onClick={() => setActive(!active)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${active
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
            }`}
        >
          {active ? (
            <>
              <Pause className="w-4 h-4" /> {t('stop')}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> {t('start')}
            </>
          )}
        </button>
      </div>

      <div className="flex-1 bg-black/50 rounded-lg border border-white/10 p-4 font-mono text-xs overflow-hidden relative">
        {/* Scanline */}
        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20 z-10 animate-scan" />

        <div className="h-full overflow-y-auto space-y-1 scrollbar-hide" ref={scrollRef}>
          {active ? (
            logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-emerald-400/90"
              >
                <span className="text-zinc-500 mr-2">&gt;</span>
                {log}
              </motion.div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-600">
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('standby')}</p>
                <p className="text-[10px]">{t('connect_msg')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
