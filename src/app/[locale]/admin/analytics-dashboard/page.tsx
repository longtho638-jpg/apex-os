'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Users, Activity, TrendingUp } from 'lucide-react';

interface RevenueMetrics {
  totalVolume30d: number;
  grossSpreadRevenue: number;
  netRevenue: number;
  monthlyRunRate: number;
  annualRunRate: number;
  activeTraders: number;
  arpt: number;
  revenuePerMillion: number;
  avgSpreadBps: number;
}

interface FunnelStep {
  name: string;
  value: number;
  fill: string;
}

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [funnel, setFunnel] = useState<FunnelStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [revRes, funnelRes] = await Promise.all([
          fetch('/api/admin/analytics/revenue'),
          fetch('/api/admin/analytics/funnel')
        ]);
        
        const revData = await revRes.json();
        const funnelData = await funnelRes.json();

        setMetrics(revData);
        setFunnel(funnelData.funnel);
      } catch (error) {
        logger.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading God View...</div>;

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
              God View Analytics
            </h1>
            <p className="text-zinc-400">Real-time revenue and conversion tracking</p>
          </header>

          {/* RaaS Revenue Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">Net Revenue</p>
                  <h3 className="text-2xl font-bold text-emerald-400">${metrics?.netRevenue.toLocaleString()}</h3>
                </div>
                <DollarSign className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-xs text-zinc-500">30-Day Spread Revenue (Net)</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">Volume (30d)</p>
                  <h3 className="text-2xl font-bold text-blue-400">${metrics?.totalVolume30d.toLocaleString()}</h3>
                </div>
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-xs text-zinc-500">Total Trading Volume</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">Active Traders</p>
                  <h3 className="text-2xl font-bold text-cyan-400">{metrics?.activeTraders.toLocaleString()}</h3>
                </div>
                <Activity className="w-6 h-6 text-cyan-500" />
              </div>
              <p className="text-xs text-zinc-500">Traders with Volume &gt; 0</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-zinc-400 text-sm">ARPT</p>
                  <h3 className="text-2xl font-bold text-purple-400">${metrics?.arpt.toFixed(0)}</h3>
                </div>
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-xs text-zinc-500">Avg Revenue Per Trader</p>
            </GlassCard>
          </div>

          {/* Funnel Chart */}
          <GlassCard className="p-8 h-[500px]">
            <h3 className="text-xl font-bold mb-6 text-white">Conversion Funnel</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#52525b" />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                  {funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
