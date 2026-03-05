'use client';

import { Calendar, Download, LineChart, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
// import { PnlChart } from '@/components/trading/PnlChart'; // Planned: chart visualization
// import { PnlBreakdown } from '@/components/trading/PnlBreakdown'; // Planned: position breakdown table
import { WowEmptyState } from '@/components/ui/WowEmptyState';
import { useAuth } from '@/contexts/AuthContext';

export default function PnlPage() {
  const router = useRouter();
  const { user } = useAuth();
  const _userId = user?.id || '';

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <LineChart className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Performance Analytics</h1>
                  <p className="text-sm text-zinc-400">Track your P&L and trading metrics</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-colors">
                  <Calendar className="w-4 h-4" /> Last 30 Days
                </button>
                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition-colors">
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GlassCard className="p-6">
                <div className="text-sm text-zinc-400 mb-1">Total Profit</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">+$12,450.32</div>
                <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12.5% vs last month
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-zinc-400 mb-1">Win Rate</div>
                <div className="text-3xl font-mono font-bold text-white">68.4%</div>
                <div className="w-full h-1 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[68.4%]" />
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="text-sm text-zinc-400 mb-1">Profit Factor</div>
                <div className="text-3xl font-mono font-bold text-blue-400">2.4</div>
                <div className="text-xs text-zinc-500 mt-2">Gross Profit / Gross Loss</div>
              </GlassCard>
            </div>

            <GlassCard className="p-6 min-h-[400px]">
              <h3 className="font-bold mb-6">Equity Curve</h3>
              <div className="h-[300px] flex items-center justify-center bg-white/5 rounded-xl border border-white/5 border-dashed text-zinc-500">
                Chart Placeholder (Recharts Integration)
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold mb-6">Monthly Breakdown</h3>
              {/* <PnlBreakdown /> */}
              <WowEmptyState
                title="No Trading Activity"
                description="Your trading journal is empty. Start executing trades to populate your PnL analysis."
                icon={LineChart}
                action={{
                  label: 'Start Trading',
                  onClick: () => router.push('/en/trade'),
                }}
              />
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
