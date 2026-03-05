'use client';

import Cookies from 'js-cookie';
import { ShieldCheck, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { CopyConfigModal } from './CopyConfigModal';

interface Leader {
  user_id: string;
  display_name: string;
  description: string;
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  active_followers: number;
}

export function CopyTradingLeaderboard({ userId }: { userId: string }) {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleManualTrade = (_leader: Leader) => {
    router.push('/en/dashboard/trading?symbol=BTC&side=buy&amount=1000');
  };

  // Modal State
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeaders = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/trading/copy-trading?action=leaders');
      const data = await res.json();
      if (data.success) {
        setLeaders(data.leaders || []);
      }
    } catch (error) {
      logger.error('Failed to fetch leaders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaders();
  }, [fetchLeaders]);

  // Fetch following status
  useEffect(() => {
    const fetchFollowingStatus = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`/api/v1/trading/copy-trading?action=following&userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          const followingIds = new Set<string>(data.following.map((f: any) => String(f.leader_id)));
          setFollowing(followingIds);
        }
      } catch (error) {
        logger.error('Failed to fetch following:', error);
      }
    };

    fetchFollowingStatus();
  }, [userId]);

  const handleFollowClick = (leader: Leader) => {
    if (!userId) {
      toast.error('Please log in to copy traders');
      window.location.href = '/en/login?redirect=/copy-trading';
      return;
    }
    setSelectedLeader(leader);
    setIsModalOpen(true);
  };

  const handleConfirmCopy = async (amount: number, stopLoss: number) => {
    if (!selectedLeader) return;

    try {
      const csrfToken = Cookies.get('csrf_token');
      const res = await fetch('/api/v1/trading/copy-trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          action: 'follow',
          userId,
          leaderId: selectedLeader.user_id, // Use user_id, not id
          copyAmount: amount,
          stopLoss,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setFollowing((prev) => new Set(prev).add(selectedLeader.user_id)); // Use user_id
        await fetchLeaders();
        toast.success(`Successfully copying ${selectedLeader.display_name}`);
      } else {
        logger.error('[CopyTrading] API Error:', data);
        toast.error(data.message || data.error || 'Failed to copy leader');
      }
    } catch (error) {
      logger.error('Failed to follow leader:', error);
      toast.error('Network error occurred');
    }
  };

  const unfollowLeader = async (leaderId: string) => {
    try {
      const csrfToken = Cookies.get('csrf_token');
      const res = await fetch('/api/v1/trading/copy-trading', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
        },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({ userId, leaderId: leaderId }), // leaderId is already user_id
      });

      const data = await res.json();
      if (data.success) {
        setFollowing((prev) => {
          const newSet = new Set(prev);
          newSet.delete(leaderId);
          return newSet;
        });
        await fetchLeaders();
        toast.success('Stopped copying leader');
      }
    } catch (error) {
      logger.error('Failed to unfollow leader:', error);
    }
  };

  if (loading) {
    return <div className="text-center p-8 text-zinc-500 animate-pulse">Loading top traders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Top Traders</h2>
          <p className="text-sm text-zinc-400">Select a pro trader to mirror their positions automatically.</p>
        </div>
        <div className="px-3 py-1 bg-[#00FF94]/10 border border-[#00FF94]/20 rounded-full text-[#00FF94] text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-3 h-3" />
          Verified Performance
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leaders.map((leader) => {
          const isFollowing = following.has(leader.user_id);
          const isProfitable = leader.total_pnl >= 0;

          return (
            <Card key={leader.user_id} className="bg-zinc-900/50 border-white/5 hover:border-white/10 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      {leader.display_name}
                      {leader.total_trades > 100 && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="bg-white/5 text-zinc-400 hover:bg-white/10 text-[10px]">
                        {leader.total_trades} Trades
                      </Badge>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${isProfitable ? 'text-[#00FF94]' : 'text-red-500'}`}>
                    {isProfitable ? '+' : ''}${leader.total_pnl.toLocaleString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {leader.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2 min-h-[2.5em]">{leader.description}</p>
                )}

                <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-black/20 border border-white/5">
                  <div className="text-center">
                    <p className="text-zinc-500 text-[10px] uppercase">Win Rate</p>
                    <p className="font-bold text-white">{leader.win_rate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase">Followers</p>
                    <p className="font-bold text-white">{leader.active_followers}</p>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <p className="text-zinc-500 text-[10px] uppercase">Risk</p>
                    <p className={`font-bold ${leader.win_rate > 60 ? 'text-green-400' : 'text-orange-400'}`}>
                      {leader.win_rate > 60 ? 'Low' : 'Med'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    className={`flex-1 font-bold ${
                      isFollowing
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-red-900/20 hover:text-red-400 hover:border-red-500/50 border border-transparent'
                        : 'bg-[#00FF94] text-black hover:bg-[#00CC76]'
                    }`}
                    variant={isFollowing ? 'outline' : 'default'}
                    onClick={() => (isFollowing ? unfollowLeader(leader.user_id) : handleFollowClick(leader))}
                  >
                    {isFollowing ? 'Stop Copying' : 'Copy'}
                  </Button>
                  <Button
                    className="flex-1 font-bold bg-white/5 text-white hover:bg-white/10 border border-white/10"
                    variant="outline"
                    onClick={() => handleManualTrade(leader)}
                  >
                    Trade
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Config Modal */}
      {selectedLeader && (
        <CopyConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          leaderName={selectedLeader.display_name}
          leaderWinRate={selectedLeader.win_rate}
          onConfirm={handleConfirmCopy}
        />
      )}
    </div>
  );
}
