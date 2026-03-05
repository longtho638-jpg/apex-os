'use client';

import { AlertTriangle, Power, ShieldOff, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

export default function SystemOverridePage() {
  const [maintenance, setMaintenance] = useState(false);
  const [withdrawals, setWithdrawals] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  // Mock logs from God Mode
  useEffect(() => {
    const agents = ['COLLECTOR', 'AUDITOR', 'GUARDIAN', 'CONCIERGE'];
    const actions = [
      'Fetching BTC price from Binance',
      'Reconciling fees for UID-003',
      'Calculating rebates for UID-005',
      'Checking liquidation risk for UID-007',
      'Syncing 142 trades from Bybit',
      'Updating portfolio snapshot for UID-004',
      'Running volatility scan on ETH/USDT',
      'Processing payout: $842.50 → UID-009',
    ];

    const interval = setInterval(() => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];

      setLogs((prev) => [`[${timestamp}] [${agent}] ${action}`, ...prev].slice(0, 15));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8" /> System Override
            </h1>
            <p className="text-zinc-400">Emergency Controls. Use with extreme caution.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Emergency Controls */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Critical Controls</h2>
              <GlassCard className="p-6 flex items-center justify-between border-red-500/30 bg-red-900/10">
                <div>
                  <h3 className="font-bold text-lg text-white">Maintenance Mode</h3>
                  <p className="text-sm text-zinc-400">Disconnects all users. Stops all bots.</p>
                </div>
                <button
                  onClick={() => setMaintenance(!maintenance)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    maintenance ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <Power className="w-5 h-5" /> {maintenance ? 'ENABLED' : 'DISABLED'}
                </button>
              </GlassCard>

              <GlassCard className="p-6 flex items-center justify-between border-yellow-500/30 bg-yellow-900/10">
                <div>
                  <h3 className="font-bold text-lg text-white">Withdrawal Circuit Breaker</h3>
                  <p className="text-sm text-zinc-400">Freeze all outbound transactions.</p>
                </div>
                <button
                  onClick={() => setWithdrawals(!withdrawals)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    !withdrawals ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <ShieldOff className="w-5 h-5" /> {withdrawals ? 'ACTIVE' : 'HALTED'}
                </button>
              </GlassCard>
            </div>

            {/* Agent Status */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Agent Status</h2>
              <div className="space-y-4">
                <AgentStatusCard
                  name="DATA COLLECTOR"
                  status="ONLINE"
                  uptime="99.99%"
                  load="42%"
                  color="text-emerald-500"
                />
                <AgentStatusCard
                  name="RISK AUDITOR"
                  status="ONLINE"
                  uptime="99.95%"
                  load="12%"
                  color="text-emerald-500"
                />
                <AgentStatusCard
                  name="SECURITY GUARDIAN"
                  status="ONLINE"
                  uptime="100.00%"
                  load="05%"
                  color="text-emerald-500"
                />
                <AgentStatusCard
                  name="USER CONCIERGE"
                  status="BUSY"
                  uptime="98.50%"
                  load="89%"
                  color="text-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="rounded-xl border border-white/10 bg-black p-6 font-mono text-sm h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
              <Terminal className="h-4 w-4 text-amber-500" />
              <span className="text-gray-400">System Logs</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto space-y-2">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-green-500/80 border-l-2 border-transparent hover:border-green-500 pl-2 transition-colors"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AgentStatusCard({ name, status, uptime, load, color }: any) {
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center justify-between">
      <div>
        <div className="font-bold text-white">{name}</div>
        <div className="text-xs text-gray-500">Uptime: {uptime}</div>
      </div>
      <div className="text-right">
        <div className={cn('font-bold text-sm flex items-center gap-2 justify-end', color || 'text-green-500')}>
          <div className={cn('h-2 w-2 rounded-full', color === 'text-yellow-500' ? 'bg-yellow-500' : 'bg-green-500')} />
          {status}
        </div>
        <div className="text-xs text-gray-500">Load: {load}</div>
      </div>
    </div>
  );
}
