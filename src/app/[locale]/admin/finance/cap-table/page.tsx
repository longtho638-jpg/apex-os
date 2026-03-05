'use client';

import { DollarSign, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ExitCalculator } from '@/components/admin/ExitCalculator';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  shares_owned: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function CapTablePage() {
  const [holders, setHolders] = useState<Stakeholder[]>([]);
  const [valuation, _setValuation] = useState(10000000);
  const [totalShares, _setTotalShares] = useState(10000000);

  useEffect(() => {
    // Mock fetch - in prod fetch from API
    // We will use the seed data from migration for visual
    const mockData = [
      { id: '1', name: 'Founder', role: 'founder', shares_owned: 6000000 },
      { id: '2', name: 'Co-Founder', role: 'founder', shares_owned: 2000000 },
      { id: '3', name: 'Seed Investor', role: 'investor', shares_owned: 1000000 },
      { id: '4', name: 'ESOP Pool', role: 'employee', shares_owned: 1000000 },
    ];
    setHolders(mockData);
  }, []);

  const chartData = holders.map((h) => ({
    name: h.name,
    value: h.shares_owned,
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Cap Table Tracker
            </h1>
            <p className="text-zinc-400">Equity Management & Valuation</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Valuation</p>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold">${(valuation / 1000000).toFixed(1)}M</h3>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Share Price</p>
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">${(valuation / totalShares).toFixed(2)}</h3>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Stakeholders</p>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">{holders.length}</h3>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 h-[400px]">
              <h3 className="text-lg font-bold mb-4">Equity Distribution</h3>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4">Cap Table Detail</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-white/10">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2 text-right">Shares</th>
                      <th className="pb-2 text-right">%</th>
                      <th className="pb-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holders.map((h, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 font-bold">{h.name}</td>
                        <td className="py-3 capitalize text-zinc-400">{h.role}</td>
                        <td className="py-3 text-right font-mono">{h.shares_owned.toLocaleString()}</td>
                        <td className="py-3 text-right text-zinc-400">
                          {((h.shares_owned / totalShares) * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 text-right text-emerald-400">
                          ${((h.shares_owned / totalShares) * valuation).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          <div className="mt-8">
            <ExitCalculator />
          </div>
        </div>
      </main>
    </div>
  );
}
