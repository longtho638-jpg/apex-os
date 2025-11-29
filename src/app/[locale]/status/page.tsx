'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, Database, Mail, Cpu, CheckCircle, AlertCircle } from 'lucide-react';

export default function StatusPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/health/diagnosis')
      .then(res => res.json())
      .then(data => {
          setStatus(data);
          setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Checking Systems...</div>;

  const isHealthy = status?.status === 'healthy';

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">System Status</h1>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${isHealthy ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {isHealthy ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {isHealthy ? 'All Systems Operational' : 'System Issues Detected'}
            </div>
        </div>

        <GlassCard className="p-6">
            <div className="space-y-4">
                <StatusItem 
                    icon={<Database className="w-5 h-5 text-blue-400" />}
                    label="Database (Supabase)"
                    status={status?.checks?.database?.status}
                    latency={status?.checks?.database?.latency}
                />
                <StatusItem 
                    icon={<Mail className="w-5 h-5 text-purple-400" />}
                    label="Email Service (Resend)"
                    status={status?.checks?.email?.status}
                />
                <StatusItem 
                    icon={<Cpu className="w-5 h-5 text-orange-400" />}
                    label="AI Engine (OpenRouter)"
                    status={status?.checks?.ai?.status}
                    latency={status?.checks?.ai?.latency}
                />
            </div>
        </GlassCard>

        <p className="text-center text-zinc-500 text-sm">
            Last Updated: {new Date(status?.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function StatusItem({ icon, label, status, latency }: { icon: any, label: string, status: string, latency?: number }) {
    const isUp = status === 'operational';
    return (
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
                <div>
                    <p className="font-bold">{label}</p>
                    {latency !== undefined && <p className="text-xs text-zinc-500">{latency}ms latency</p>}
                </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {status?.toUpperCase()}
            </span>
        </div>
    );
}
