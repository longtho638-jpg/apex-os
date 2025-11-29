'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Copy, QrCode, Twitter, Trophy } from 'lucide-react';

interface ReferralStats {
  code: string;
  total_referrals: number;
  total_earnings: number;
}

export default function ReferralDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch referral stats
    fetch(`/api/user/referrals?userId=${userId}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [userId]);

  const referralLink = stats ? `https://apexrebate.com/r/${stats.code}` : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-2xl font-bold mb-4">Referral Program</h2>
        <p className="text-zinc-400 mb-6">
          Invite friends and earn up to 30% commission on their subscriptions forever.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-zinc-400">Total Referrals</p>
            <p className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-zinc-400">Total Earnings</p>
            <p className="text-2xl font-bold text-emerald-400">${stats?.total_earnings.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-white/5">
            <p className="text-sm text-zinc-400">Your Tier Rate</p>
            <p className="text-2xl font-bold text-blue-400">20%</p> 
            {/* Dynamic tier rate logic would go here */}
          </div>
        </div>

        <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center gap-4">
          <input 
            readOnly 
            value={referralLink || 'Loading...'} 
            className="bg-transparent flex-1 text-zinc-300 focus:outline-none"
          />
          <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Copy className={`w-5 h-5 ${copied ? 'text-emerald-400' : 'text-zinc-400'}`} />
          </button>
        </div>

        <div className="flex gap-4 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2]/30 transition">
            <Twitter className="w-4 h-4" /> Share on Twitter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition">
            <QrCode className="w-4 h-4" /> QR Code
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" /> Leaderboard
        </h3>
        <div className="text-center py-8 text-zinc-500">
          Leaderboard coming soon! Be the first to top the charts.
        </div>
      </GlassCard>
    </div>
  );
}