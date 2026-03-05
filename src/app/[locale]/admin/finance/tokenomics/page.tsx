'use client';

import { Coins, Rocket } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { APEX_TOKENOMICS } from '@/config/tokenomics';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function TokenomicsDashboardPage() {
  const data = Object.entries(APEX_TOKENOMICS.allocations).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value * APEX_TOKENOMICS.totalSupply,
  }));

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tokenomics Dashboard
            </h1>
            <p className="text-zinc-400">APEX Token Allocation & Vesting</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-6 h-[400px]">
              <h3 className="text-lg font-bold mb-4">Allocation Distribution</h3>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>

            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Total Supply</h3>
                  <Coins className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-4xl font-bold text-white font-mono">
                  1,000,000,000 <span className="text-lg text-zinc-500">APEX</span>
                </p>
              </GlassCard>

              <GlassCard className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Projected FDV</h3>
                  <Rocket className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-emerald-400 font-mono">$50,000,000</p>
                <p className="text-xs text-zinc-500 mt-2">@ $0.05 Listing Price</p>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-bold mb-4">Vesting Schedule</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Team</span>
                    <span>{APEX_TOKENOMICS.vesting.team}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-zinc-400">Investors</span>
                    <span>{APEX_TOKENOMICS.vesting.investors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Community</span>
                    <span>{APEX_TOKENOMICS.vesting.community}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
