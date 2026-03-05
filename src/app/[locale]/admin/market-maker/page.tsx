'use client';

import { Activity, Play, Settings, Square } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';

export default function MarketMakerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const toggleBot = () => {
    setIsRunning(!isRunning);
    // In prod: Call API to start/stop server-side bot process
    if (!isRunning) {
      setLogs((prev) => ['[SYSTEM] Bot Initialized...', ...prev]);
    } else {
      setLogs((prev) => ['[SYSTEM] Bot Stopping...', ...prev]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Liquidity Engine</h1>
            <p className="text-zinc-400">Automated Market Maker for APEX Token.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-6 h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-400" /> Live Order Book
                  </h3>
                  <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Spread: 0.2%</span>
                </div>
                <div className="flex-1 bg-black/50 rounded-lg border border-white/10 p-4 flex gap-4 font-mono text-xs">
                  <div className="flex-1">
                    <p className="text-zinc-500 mb-2 text-center">BIDS</p>
                    <div className="space-y-1 text-emerald-400 text-right">
                      <p>0.0499 - 5000</p>
                      <p>0.0498 - 1200</p>
                      <p>0.0495 - 10000</p>
                    </div>
                  </div>
                  <div className="w-px bg-white/10"></div>
                  <div className="flex-1">
                    <p className="text-zinc-500 mb-2 text-center">ASKS</p>
                    <div className="space-y-1 text-red-400">
                      <p>0.0501 - 4500</p>
                      <p>0.0503 - 2000</p>
                      <p>0.0505 - 8000</p>
                    </div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-bold mb-4">Bot Logs</h3>
                <div className="bg-black rounded-lg p-4 h-40 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                  {logs.length === 0 && <div className="text-zinc-600 italic">Waiting for start...</div>}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="p-6 text-center">
                <div
                  className={`w-4 h-4 rounded-full mx-auto mb-4 ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}
                />
                <h3 className="text-2xl font-bold mb-1">{isRunning ? 'RUNNING' : 'STOPPED'}</h3>
                <p className="text-xs text-zinc-500 mb-6">Uptime: {isRunning ? '0h 4m 12s' : '0s'}</p>

                <button
                  onClick={toggleBot}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isRunning
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Square className="w-5 h-5" /> TERMINATE
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" /> INITIATE
                    </>
                  )}
                </button>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zinc-400" /> Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Order Size ($)</label>
                    <input
                      type="number"
                      defaultValue={1000}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Target Spread (%)</label>
                    <input
                      type="number"
                      defaultValue={0.2}
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-sm"
                    />
                  </div>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded text-xs font-bold">
                    Update Params
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
