'use client';

import { Activity, CheckCircle } from 'lucide-react';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';

export default function StatusPage() {
  const systems = [
    { name: 'API Gateway', status: 'operational', uptime: '99.99%' },
    { name: 'WebSocket Feed', status: 'operational', uptime: '99.98%' },
    { name: 'Trading Engine', status: 'operational', uptime: '100.00%' },
    { name: 'Withdrawals (ETH)', status: 'operational', uptime: '99.95%' },
    { name: 'Withdrawals (BTC)', status: 'operational', uptime: '99.99%' },
    { name: 'User Dashboard', status: 'operational', uptime: '99.99%' },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 font-sans relative">
      <ParticleBackground />
      <SiteHeader />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold mb-6">
              <CheckCircle className="w-5 h-5" />
              All Systems Operational
            </div>
            <h1 className="text-4xl font-bold mb-4">System Status</h1>
            <p className="text-zinc-400">Live performance metrics and incident reports.</p>
          </div>

          <div className="grid gap-4 mb-12">
            {systems.map((sys) => (
              <div
                key={sys.name}
                className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />
                  </div>
                  <span className="font-bold text-lg">{sys.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-zinc-500 text-sm font-mono">Uptime: {sys.uptime}</span>
                  <span className="text-emerald-400 font-bold uppercase text-sm tracking-wider">Operational</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="text-zinc-400" />
              Past Incidents
            </h2>
            <div className="space-y-8">
              <div className="border-l-2 border-emerald-500 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#030303] border-2 border-emerald-500" />
                <div className="text-sm text-zinc-500 mb-1">December 1, 2025</div>
                <h3 className="font-bold text-white mb-2">Scheduled Maintenance Completed</h3>
                <p className="text-zinc-400">
                  We successfully completed the scheduled upgrade to our matching engine. Latency has been reduced by
                  15%.
                </p>
              </div>
              <div className="border-l-2 border-zinc-800 pl-6 relative">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#030303] border-2 border-zinc-800" />
                <div className="text-sm text-zinc-500 mb-1">November 28, 2025</div>
                <h3 className="font-bold text-white mb-2">API Latency Spike</h3>
                <p className="text-zinc-400">
                  We observed a brief spike in API latency due to high volume. Auto-scaling triggered and resolved the
                  issue within 2 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
