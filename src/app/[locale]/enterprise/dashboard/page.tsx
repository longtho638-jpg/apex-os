'use client';

import { Activity, Check, Copy, DollarSign, Key, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';

interface UsageMetric {
  time: string;
  requests: number;
  errors: number;
  latency: number;
}

export default function EnterpriseDashboardPage() {
  const [usageData, setUsageData] = useState<UsageMetric[]>([]);
  const [_loading, setLoading] = useState(true);
  const { isElite, isWhale, loading: tierLoading } = useUserTier();
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const generateKey = () => {
    const key = `sk_live_${Array.from({ length: 32 }, () => Math.floor(Math.random() * 36).toString(36)).join('')}`;
    setApiKey(key);
    toast.success('New API Key Generated');
  };

  const copyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  if (tierLoading) return null;

  if (!isElite && !isWhale) {
    return (
      <div className="flex h-screen w-full bg-[#030303] text-white font-sans items-center justify-center relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        <GlassCard className="p-12 max-w-lg text-center z-10 border-purple-500/30">
          <Lock className="w-16 h-16 text-purple-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Enterprise Access Required</h1>
          <p className="text-zinc-400 mb-8">
            The Developer API and White Label tools are available exclusively for Elite and Whale tiers.
          </p>
          <button
            onClick={() => router.push('/en/billing')}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
          >
            Upgrade to Elite
          </button>
        </GlassCard>
      </div>
    );
  }

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
            {apiKey ? (
              <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2">
                <code className="text-sm font-mono text-emerald-400">{apiKey}</code>
                <button onClick={copyKey} className="text-zinc-400 hover:text-white">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <button
                onClick={generateKey}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold flex items-center gap-2"
              >
                <Key className="w-4 h-4" /> Generate New Key
              </button>
            )}
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
