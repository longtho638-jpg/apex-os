'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Users, DollarSign, MousePointer, Copy, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface AffiliateStats {
  clicks: number;
  signups: number;
  paid_conversions: number;
  total_commission: number;
  pending_payout: number;
}

export default function AffiliateDashboardPage() {
  const [stats, setStats] = useState<AffiliateStats>({
    clicks: 0,
    signups: 0,
    paid_conversions: 0,
    total_commission: 0,
    pending_payout: 0
  });
  const [refLink, setRefLink] = useState('https://apexrebate.com/r/YOURCODE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch - in prod fetch from API
    // In a real implementation, we would fetch this user's affiliate stats
    setTimeout(() => {
        setStats({
            clicks: 1240,
            signups: 85,
            paid_conversions: 12,
            total_commission: 450.00,
            pending_payout: 120.00
        });
        setLoading(false);
    }, 1000);
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Affiliate Partner Portal
              </h1>
              <p className="text-zinc-400">Track your performance and earnings.</p>
            </div>
            <Link 
                href="/affiliate/assets" 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors"
            >
                Marketing Assets
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Total Clicks</p>
                <MousePointer className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.clicks}</h3>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Signups</p>
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.signups}</h3>
              <p className="text-xs text-zinc-500 mt-1">Conversion: {((stats.signups/stats.clicks)*100).toFixed(1)}%</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Paid Users</p>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold">{stats.paid_conversions}</h3>
            </GlassCard>

            <GlassCard className="p-6 bg-emerald-900/10 border-emerald-500/20">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Pending Payout</p>
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-400">${stats.pending_payout.toFixed(2)}</h3>
              {stats.pending_payout >= 50 && (
                  <button className="mt-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded">
                      Request Payout
                  </button>
              )}
            </GlassCard>
          </div>

          {/* Referral Link */}
          <GlassCard className="p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" /> Your Referral Link
            </h3>
            <div className="flex gap-4">
                <input 
                    type="text" 
                    value={refLink} 
                    readOnly
                    className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none"
                />
                <button 
                    className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                    onClick={() => navigator.clipboard.writeText(refLink)}
                >
                    <Copy className="w-4 h-4" /> Copy
                </button>
            </div>
            <p className="text-sm text-zinc-500 mt-2">
                Tip: Add <code className="bg-white/10 px-1 rounded">?source=twitter</code> to track campaigns.
            </p>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
