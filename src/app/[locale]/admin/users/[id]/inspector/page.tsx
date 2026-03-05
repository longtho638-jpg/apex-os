'use client';

import { Activity, History, User, Wallet } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';

interface Position {
  id: string;
  side: string;
  symbol: string;
  pnl: number;
}

interface Trade {
  id: string;
  opened_at: string;
  closed_at?: string;
  status: string;
  symbol: string;
  pnl: number;
}

interface UserData {
  user: {
    id: string;
    email: string;
  };
  realWallet: {
    balance: number;
  };
  virtualWallet: {
    balance: number;
  };
  openPositions: Position[];
  recentTrades: Trade[];
  error?: string;
}

export default function UserInspectorPage() {
  const { id } = useParams();
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/users/${id}/portfolio`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-white p-10">Spying on user...</div>;
  if (data?.error) return <div className="text-red-500 p-10">Target lost: {data.error}</div>;

  const { user, realWallet, virtualWallet, openPositions, recentTrades } = data!;

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
              <User className="w-8 h-8" /> Target: {user.email}
            </h1>
            <p className="text-zinc-400 font-mono text-sm">ID: {user.id}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Wallets */}
            <GlassCard className="p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-emerald-400" /> Asset Holdings
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-zinc-400">Real Balance</span>
                  <span className="font-bold text-emerald-400">${realWallet?.balance || '0.00'}</span>
                </div>
                <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-zinc-400">Virtual Balance</span>
                  <span className="font-bold text-blue-400">${virtualWallet?.balance || '0.00'}</span>
                </div>
              </div>
            </GlassCard>

            {/* Open Positions */}
            <GlassCard className="p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-yellow-400" /> Live Positions
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {openPositions?.length === 0 && <p className="text-zinc-500 text-sm">No active trades.</p>}
                {openPositions?.map((pos) => (
                  <div key={pos.id} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span>
                      {pos.side} {pos.symbol}
                    </span>
                    <span className={pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      {pos.pnl >= 0 ? '+' : ''}
                      {Number(pos.pnl).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* History */}
          <GlassCard className="p-6">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-purple-400" /> Recent Activity
            </h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-zinc-500 border-b border-white/10">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2 text-right">PnL</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades?.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/5">
                    <td className="py-2 text-zinc-400">
                      {new Date(trade.closed_at || trade.opened_at).toLocaleDateString()}
                    </td>
                    <td className="py-2">{trade.status === 'CLOSED' ? 'Closed' : 'Opened'}</td>
                    <td className="py-2">{trade.symbol}</td>
                    <td className={`py-2 text-right ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {Number(trade.pnl).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
