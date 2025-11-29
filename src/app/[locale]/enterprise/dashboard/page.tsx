'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Key, Activity, AlertCircle, DollarSign } from 'lucide-react';

interface UsageMetric {
  time: string;
  requests: number;
  errors: number;
  latency: number;
}

export default function EnterpriseDashboardPage() {
  const [usageData, setUsageData] = useState<UsageMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for dashboard visualization (replace with real API call later)
    const data = Array.from({ length: 24 }).map((_, i) => ({
      time: `${i}:00`,
      requests: Math.floor(Math.random() * 1000) + 500,
      errors: Math.floor(Math.random() * 20),
      latency: Math.floor(Math.random() * 100) + 20,
    }));
    setUsageData(data);
    setLoading(false);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Enterprise Dashboard</h1>
              <p className="text-zinc-400">Monitor your API usage and billing.</p>
            </div>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2">
                <Key className="w-4 h-4" /> Generate New Key
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Total Requests (24h)</p>
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold">24,502</h3>
              <p className="text-xs text-emerald-400 mt-1">+12% vs yesterday</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Avg Latency</p>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold">42ms</h3>
              <p className="text-xs text-emerald-400 mt-1">Optimal</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Current Bill</p>
                <DollarSign className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold">$490.04</h3>
              <p className="text-xs text-zinc-500 mt-1">Projected: $1,200</p>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard className="p-6 h-[400px]">
              <h3 className="text-lg font-bold mb-4">API Traffic</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={usageData}>
                  <XAxis dataKey="time" stroke="#52525b" fontSize={12} />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-6 h-[400px]">
              <h3 className="text-lg font-bold mb-4">Error Rate vs Latency</h3>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={usageData}>
                  <XAxis dataKey="time" stroke="#52525b" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#52525b" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
