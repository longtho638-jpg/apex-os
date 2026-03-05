'use client';

import { motion } from 'framer-motion';
import { Crown, Filter, Search, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';
import { logger } from '@/lib/logger';

interface Strategy {
  id: string;
  name: string;
  author: string;
  authorTier: string;
  roi: number;
  winRate: number;
  followers: number;
  price: number;
  risk: string;
  description: string;
  tags: string[];
}

export default function MarketplacePage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const { available, refresh } = useWallet();
  const { tier } = useUserTier();
  const discount = tier === 'SOVEREIGN' ? 0.5 : tier === 'ARCHITECT' ? 0.2 : 0;
  const router = useRouter();

  const { user } = useAuth();

  const handleCopy = async (strat: Strategy) => {
    if (!user) return;

    const finalPrice = strat.price * (1 - discount);

    if (available < finalPrice) {
      toast.error('Insufficient Funds', {
        description: `You need $${finalPrice.toFixed(2)} to subscribe. Available: $${available.toLocaleString()}`,
      });
      return;
    }

    try {
      // Simulate API call to subscribe
      // In a real app: await fetch('/api/v1/copy-trading/subscribe', { method: 'POST', body: JSON.stringify({ strategyId: strat.id, userId: user.id }) });

      // For "Deep x10", we simulate the delay and success
      const loadingToast = toast.loading(`Processing subscription to ${strat.name}...`);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.dismiss(loadingToast);
      toast.success(`Subscribed to ${strat.name}`, {
        description:
          finalPrice > 0
            ? `Fee of $${finalPrice.toFixed(2)} deducted (${discount * 100}% OFF).`
            : 'Free subscription active.',
      });

      // Refresh wallet to show deduction (if we had a real backend deduction here)
      refresh();

      // Deep Link to Copy Trading Setup
      router.push(`/en/dashboard/copy-trading?strategy=${strat.id}&price=${strat.price}`);
    } catch (_error) {
      toast.error('Subscription Failed');
    }
  };

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await fetch('/api/marketplace/strategies');
        const data = await res.json();
        if (data.success) {
          setStrategies(data.data);
        }
      } catch (error) {
        logger.error('Failed to fetch strategies', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStrategies();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Strategy Marketplace
          </h1>
          <p className="text-xs text-zinc-400">Copy top traders & AI algorithms</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search strategies..."
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-emerald-500/50 w-64"
            />
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10">
            <Filter className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="p-8 relative z-10 max-w-7xl mx-auto w-full">
        {/* Featured Banner */}
        <div className="mb-12 p-1 rounded-3xl bg-gradient-to-r from-amber-500/20 to-purple-500/20">
          <div className="bg-black/80 backdrop-blur-xl rounded-[22px] p-8 flex items-center justify-between border border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold mb-4">
                <Crown className="w-3 h-3" /> FEATURED CREATOR
              </div>
              <h2 className="text-3xl font-bold mb-2">Whale Hunter Alpha</h2>
              <p className="text-zinc-400 max-w-lg mb-6">
                Consistently outperforming the market with 145% ROI in the last 30 days. Specialized in hunting
                liquidity clusters on Binance.
              </p>
              <div className="flex gap-4">
                <Button3D variant="primary" className="px-8">
                  Copy Now
                </Button3D>
                <Button3D variant="glass">View Performance</Button3D>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-[60px]" />
              <div className="relative z-10 text-center">
                <div className="text-5xl font-black text-emerald-400">+145.2%</div>
                <div className="text-sm text-zinc-500 font-mono uppercase tracking-widest">30 Day ROI</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['ALL', 'HIGH ROI', 'LOW RISK', 'AI POWERED', 'FREE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Strategies Grid */}
        {loading ? (
          <div className="text-center py-20 text-zinc-500">Loading strategies...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies.map((strat, index) => (
              <motion.div
                key={strat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        strat.authorTier === 'SOVEREIGN'
                          ? 'bg-amber-500 text-black'
                          : strat.authorTier === 'ARCHITECT'
                            ? 'bg-purple-500 text-white'
                            : 'bg-zinc-700 text-white'
                      }`}
                    >
                      {strat.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#00FF94] transition-colors">
                        {strat.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span>by {strat.author}</span>
                        {strat.authorTier === 'SOVEREIGN' && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                    </div>
                  </div>
                  {strat.price === 0 ? (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      FREE
                    </Badge>
                  ) : (
                    <div className="flex flex-col items-end">
                      {discount > 0 && (
                        <span className="text-[10px] text-zinc-500 line-through">${strat.price}/mo</span>
                      )}
                      <Badge variant="outline" className={discount > 0 ? 'border-emerald-500 text-emerald-400' : ''}>
                        ${(strat.price * (1 - discount)).toFixed(0)}/mo
                      </Badge>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-400 mb-6 h-10 line-clamp-2">{strat.description}</p>

                <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-black/20 rounded-xl border border-white/5">
                  <div className="text-center">
                    <div className="text-[10px] text-zinc-500 mb-1">ROI (30d)</div>
                    <div className="text-emerald-400 font-bold text-sm">+{strat.roi}%</div>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">Win Rate</div>
                    <div className="text-white font-bold text-sm">{strat.winRate}%</div>
                  </div>
                  <div className="text-center border-l border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">Copiers</div>
                    <div className="text-white font-bold text-sm">{strat.followers}</div>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <Button3D full variant="glass" className="text-xs h-9">
                    Details
                  </Button3D>
                  <Button3D full variant="primary" className="text-xs h-9" onClick={() => handleCopy(strat)}>
                    {strat.price === 0 ? 'Copy Free' : `Copy ($${(strat.price * (1 - discount)).toFixed(0)})`}
                  </Button3D>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
