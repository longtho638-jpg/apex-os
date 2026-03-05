'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Brain, Search, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useCryptoPrice } from '@/hooks/useCryptoPrice';

interface LogEntry {
  id: string;
  timestamp: string;
  agent: 'SENTIMENT' | 'TECHNICAL' | 'WHALE' | 'EXECUTION';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export function AlgoVisualizer() {
  const t = useTranslations('AI');
  const { price: realPrice, loading: priceLoading } = useCryptoPrice('bitcoin');
  const [price, setPrice] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync with real price
  useEffect(() => {
    if (realPrice > 0) setPrice(realPrice);
  }, [realPrice]);

  // Simulate Realtime Price Ticker (Micro-movements)
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      if (realPrice > 0) {
        // Add micro-noise to make it look alive between API updates
        const noise = (Math.random() - 0.5) * (realPrice * 0.0005);
        setPrice((p) => (p === 0 ? realPrice : realPrice + noise));
      } else if (!priceLoading) {
        // Fallback if API fails
        setPrice((p) => (p > 0 ? p + (Math.random() - 0.5) * 50 : 96500));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [realPrice, priceLoading, mounted]);

  // Simulate AI Agent Logic
  useEffect(() => {
    if (!mounted) return;

    const agents = [
      { name: 'SENTIMENT', color: 'text-blue-400', icon: Brain },
      { name: 'TECHNICAL', color: 'text-emerald-400', icon: Activity },
      { name: 'WHALE', color: 'text-purple-400', icon: Search },
      { name: 'EXECUTION', color: 'text-yellow-400', icon: Zap },
    ];

    const actions = [
      'Scanning Order Book depth...',
      'Calculating RSI (14) divergence...',
      'Analyzing Twitter sentiment for $BTC...',
      'Detected large wallet movement (500 BTC)...',
      'Cross-referencing Binance vs Coinbase spread...',
      'Liquidity check passed.',
      'Optimizing entry point...',
      'Rebalancing portfolio weights...',
    ];

    const interval = setInterval(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];

      let message = randomAction;
      let type: LogEntry['type'] = 'info';

      if (randomAgent.name === 'TECHNICAL' && Math.random() > 0.7) {
        message = 'RSI Oversold (28.5). Potential Reversal.';
        type = 'success';
      }
      if (randomAgent.name === 'WHALE' && Math.random() > 0.8) {
        message = '🐋 WHALE ALERT: 1,000 BTC moved to Exchange. Volatility expected.';
        type = 'warning';
      }

      setLogs((prev) => {
        const newLogs = [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            agent: randomAgent.name as any,
            message,
            type,
          },
        ];
        return newLogs.slice(-8);
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!mounted) return <div className="h-full w-full bg-white/5 animate-pulse rounded-2xl" />;

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="w-6 h-6 text-emerald-500" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <h3 className="text-lg font-bold text-white">{t('core_title')}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-zinc-500">BTC/USDT</div>
          <div className={`text-xl font-mono font-bold ${price > 96500 ? 'text-emerald-400' : 'text-red-400'}`}>
            {price > 0 ? (
              `$${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            ) : (
              <span className="text-sm animate-pulse">{t('connecting')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Visualizer Area */}
      <div className="flex-1 relative bg-black/50 rounded-xl overflow-hidden border border-white/5 p-4 font-mono text-xs">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 items-start"
              >
                <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                <span
                  className={`font-bold shrink-0 w-24 ${
                    log.agent === 'SENTIMENT'
                      ? 'text-blue-400'
                      : log.agent === 'TECHNICAL'
                        ? 'text-emerald-400'
                        : log.agent === 'WHALE'
                          ? 'text-purple-400'
                          : 'text-yellow-400'
                  }`}
                >
                  {log.agent}
                </span>
                <span
                  className={`${
                    log.type === 'warning'
                      ? 'text-yellow-200'
                      : log.type === 'success'
                        ? 'text-emerald-200'
                        : 'text-zinc-300'
                  }`}
                >
                  {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Active Threads */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-zinc-400">Arbitrage</span>
        </div>
        <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          <span className="text-xs text-zinc-400">Sentiment</span>
        </div>
        <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
          <span className="text-xs text-zinc-400">Whale Watch</span>
        </div>
      </div>
    </div>
  );
}
