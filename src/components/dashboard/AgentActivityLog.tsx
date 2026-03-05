'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Brain, Cpu, Lock, Shield, Terminal, Wifi, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

// Types
interface LogEntry {
  id: number;
  timestamp: string;
  agent: 'RISK' | 'QUANT' | 'EXEC' | 'SYS';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Mock Data Generator
const generateMockLog = (id: number, t: any): LogEntry => {
  const agents = ['RISK', 'QUANT', 'EXEC', 'SYS'] as const;
  const agent = agents[Math.floor(Math.random() * agents.length)];
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

  let message = '';
  let type: LogEntry['type'] = 'info';

  switch (agent) {
    case 'RISK': {
      const riskMsgs = [
        t('risk_calc'),
        t('risk_check'),
        t('risk_vol'),
        'Portfolio Delta: +0.04 (Neutral)',
        'VaR (Value at Risk) updated: 1.2%',
      ];
      message = riskMsgs[Math.floor(Math.random() * riskMsgs.length)];
      type = 'warning';
      break;
    }
    case 'QUANT': {
      const quantMsgs = [
        t('quant_pattern'),
        t('quant_depth'),
        'Backtesting strategy S-402 on 1m timeframe.',
        'Optimizing liquidity pools...',
        'Cross-exchange arbitrage opportunity found.',
      ];
      message = quantMsgs[Math.floor(Math.random() * quantMsgs.length)];
      type = 'info';
      break;
    }
    case 'EXEC': {
      const execMsgs = [
        t('exec_order'),
        t('exec_fill'),
        'Smart routing via 1inch aggregator...',
        'Routing via optimal path (Binance -> OKX).',
        'Smart routing active.',
      ];
      message = execMsgs[Math.floor(Math.random() * execMsgs.length)];
      type = 'success';
      break;
    }
    case 'SYS': {
      const sysMsgs = [t('sys_sync'), t('sys_latency'), 'Database backup completed.', 'Garbage collection complete.'];
      message = sysMsgs[Math.floor(Math.random() * sysMsgs.length)];
      type = 'info';
      break;
    }
  }

  return { id, timestamp, agent, message, type };
};

export function AgentActivityLog() {
  const t = useTranslations('DashboardComponents.AgentLog');
  const [activeTab, setActiveTab] = useState<'logs' | 'feed'>('logs');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemLoad, setSystemLoad] = useState(42);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial Population
  useEffect(() => {
    const initial = Array.from({ length: 8 }).map((_, i) => generateMockLog(i, t));
    setLogs(initial);
  }, []);

  // Live Log Stream
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = generateMockLog(Date.now(), t);
        const newLogs = [...prev, newLog];
        if (newLogs.length > 50) newLogs.shift(); // Keep buffer size managed
        return newLogs;
      });

      // Fluctuate system load
      setSystemLoad((prev) => {
        const change = Math.random() * 10 - 5;
        return Math.min(Math.max(Math.round(prev + change), 20), 98);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [t]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full min-h-[600px] bg-[#050505] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative font-mono">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] pointer-events-none" />

      {/* --- HEADER --- */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider">System Load</p>
          <p className="text-xl font-bold text-emerald-400 font-mono">{systemLoad}%</p>
        </div>
        <div className="w-24 h-8 flex items-end gap-0.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 bg-emerald-500/20 rounded-sm"
              animate={{
                height: `${Math.random() * 100}%`,
                backgroundColor: Math.random() > 0.8 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.2)',
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            />
          ))}
        </div>
      </div>

      {/* --- AGENT STATUS CARDS --- */}
      <div className="relative z-10 grid grid-cols-3 gap-px bg-white/10 border-b border-white/10">
        {/* RISK AGENT */}
        <div className="bg-[#0a0a0a] p-3 flex items-center gap-3 group relative overflow-hidden">
          <div className="p-2 bg-red-900/20 rounded-lg border border-red-500/20 group-hover:border-red-500/50 transition-colors">
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold tracking-wider">AGENT: RISK</p>
            <p className="text-xs text-red-400 font-bold animate-pulse">ARMED</p>
          </div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* QUANT AGENT */}
        <div className="bg-[#0a0a0a] p-3 flex items-center gap-3 group relative overflow-hidden">
          <div className="p-2 bg-blue-900/20 rounded-lg border border-blue-500/20 group-hover:border-blue-500/50 transition-colors">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold tracking-wider">AGENT: QUANT</p>
            <p className="text-xs text-blue-400 font-bold">ANALYZING</p>
          </div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* EXECUTION AGENT */}
        <div className="bg-[#0a0a0a] p-3 flex items-center gap-3 group relative overflow-hidden">
          <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold tracking-wider">AGENT: EXEC</p>
            <p className="text-xs text-amber-400 font-bold">STANDBY</p>
          </div>
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* --- LOG STREAM --- */}
      <div className="relative flex-1 p-4 h-[450px] overflow-hidden">
        {/* Scanning Laser Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] z-20 pointer-events-none"
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10 pointer-events-none" />

        {/* Logs Container */}
        <div ref={scrollRef} className="h-full overflow-y-auto scrollbar-hide space-y-1 pb-10 relative z-0">
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-start gap-3 text-xs md:text-sm hover:bg-white/5 p-1 rounded transition-colors"
              >
                <span className="text-zinc-600 shrink-0 font-mono">[{log.timestamp}]</span>

                <span
                  className={`
                  shrink-0 font-bold w-16
                  ${
                    log.agent === 'RISK'
                      ? 'text-red-400'
                      : log.agent === 'QUANT'
                        ? 'text-blue-400'
                        : log.agent === 'EXEC'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                  }
                `}
                >
                  {log.agent}::
                </span>

                <TypewriterText
                  text={log.message}
                  color={
                    log.type === 'error'
                      ? 'text-red-500'
                      : log.type === 'warning'
                        ? 'text-amber-500'
                        : log.type === 'success'
                          ? 'text-emerald-400'
                          : 'text-zinc-300'
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Blinking Cursor at the end */}
          <div className="h-4 w-2 bg-emerald-500 animate-pulse mt-2" />
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur border-t border-white/10 px-4 py-2 flex justify-between items-center z-20 text-[10px] text-zinc-500 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-500">
            <Wifi className="w-3 h-3" /> ONLINE
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3" /> LATENCY: 14ms
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" /> ENCRYPTED // SHA-256
        </div>
      </div>
    </div>
  );
}

// Helper for Typewriter Effect
function TypewriterText({ text, color }: { text: string; color: string }) {
  return <span className={`${color} font-mono break-words`}>{text}</span>;
}
