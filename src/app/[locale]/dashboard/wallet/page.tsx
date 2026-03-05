'use client';

import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  Eye,
  History,
  LockKeyhole,
  TrendingUp,
  Upload,
  Wallet,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { DepositModal } from '@/components/wallet/DepositModal';
import { WithdrawModal } from '@/components/wallet/WithdrawModal';
import { useAuth } from '@/contexts/AuthContext';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';
import { getSupabaseClientSide } from '@/lib/supabase';

export default function WalletPage() {
  const { user } = useAuth();
  const { total, available, locked, profit } = useWallet();
  const { tier } = useUserTier();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pnlData, setPnlData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState(false);

  // Modal States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const { refresh } = useWallet();

  const supabase = getSupabaseClientSide();

  useEffect(() => {
    if (!user) return;

    async function fetchTransactions() {
      // 3. Get Transactions
      const { data: txs } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true }); // Fetch all for chart, sort ascending

      if (txs) {
        // Sort descending for list
        setTransactions([...txs].reverse().slice(0, 10));

        // Calculate Cumulative PnL for Chart
        let runningBalance = 0;
        const chartData = txs.map((tx, i) => {
          runningBalance += tx.amount;
          return {
            day: i + 1,
            value: runningBalance,
            date: new Date(tx.created_at).toLocaleDateString(),
          };
        });

        // If no data, show flat line at 0
        if (chartData.length === 0) {
          setPnlData([
            { day: 1, value: 0 },
            { day: 30, value: 0 },
          ]);
        } else {
          setPnlData(chartData);
        }
      }
      setLoading(false);
    }

    fetchTransactions();
  }, [user, supabase.from]);

  const balance = { total, available, locked, profit };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#030303] text-white p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Wallet className="w-8 h-8 text-[#00FF94]" />
              ASSET VAULT
            </h1>
            <p className="text-zinc-400 mt-1">Secure institutional-grade asset management.</p>
          </div>
          <div className="flex gap-3">
            <Button3D variant="glass" className="px-6" onClick={() => setIsDepositOpen(true)}>
              <Upload className="w-4 h-4 mr-2" /> Deposit
            </Button3D>
            <Button3D variant="primary" className="px-6" onClick={() => setIsWithdrawOpen(true)}>
              <Download className="w-4 h-4 mr-2" /> Withdraw
            </Button3D>
          </div>
        </div>

        {/* MODALS */}
        <DepositModal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} onDeposited={refresh} />
        <WithdrawModal
          isOpen={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          available={available}
          onWithdrawn={refresh}
        />

        {/* TOP SECTION: CARD & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* 1. APEX BLACK CARD (Virtual) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-64 rounded-3xl overflow-hidden shadow-2xl group perspective-1000"
          >
            {/* Card Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl transform transition-transform duration-500 group-hover:scale-[1.02]">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FF94]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-black transform rotate-45" />
                  </div>
                  <span className="font-black tracking-tighter text-lg">
                    APEX<span className="text-[#00FF94]">OS</span>
                  </span>
                </div>
                <CreditCard className="w-8 h-8 text-zinc-600" />
              </div>

              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase tracking-widest">Total Balance</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-mono font-black text-white tracking-tight">
                    {showCardDetails
                      ? `$${balance.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : '•••••••••••'}
                  </h2>
                  <button
                    onClick={() => setShowCardDetails(!showCardDetails)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {showCardDetails ? (
                      <Eye className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <LockKeyhole className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase mb-1">Card Holder</p>
                  <p className="font-bold text-white uppercase tracking-wider">
                    {user?.email?.split('@')[0] || 'TRADER'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 text-[10px] uppercase mb-1">Tier Status</p>
                  <p className="font-bold text-[#00FF94] uppercase tracking-wider">{tier} MEMBER</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. ASSET GROWTH CHART */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2 text-zinc-300">
                <TrendingUp className="w-5 h-5 text-[#00FF94]" /> Asset Growth (30d)
              </h3>
              <div className="flex gap-2">
                <Badge className="bg-[#00FF94]/10 text-[#00FF94] border-0">+12.5%</Badge>
                <Badge className="bg-white/5 text-zinc-400 border-white/10">USD</Badge>
              </div>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pnlData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00FF94" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#00FF94', fontWeight: 'bold', fontFamily: 'monospace' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00FF94"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: STATS & HISTORY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3. QUICK STATS */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Available</p>
                <p className="text-2xl font-mono font-bold text-white">${balance.available.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Locked / Staking</p>
                <p className="text-2xl font-mono font-bold text-white">${balance.locked.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <LockKeyhole className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Total Profit</p>
                <p
                  className={`text-2xl font-mono font-bold ${balance.profit >= 0 ? 'text-[#00FF94]' : 'text-red-500'}`}
                >
                  {balance.profit >= 0 ? '+' : ''}$
                  {balance.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-[#00FF94]/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#00FF94]" />
              </div>
            </div>
          </div>

          {/* 4. TRANSACTION HISTORY */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold flex items-center gap-2 text-zinc-300">
                <History className="w-5 h-5 text-purple-400" /> Recent Transactions
              </h3>
              <button className="text-xs text-zinc-500 hover:text-white transition-colors">View All</button>
            </div>

            <div className="space-y-3">
              {loading ? (
                [1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          tx.type === 'DEPOSIT'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : tx.type === 'WITHDRAWAL'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {tx.type === 'DEPOSIT' ? (
                          <ArrowDownLeft size={20} />
                        ) : tx.type === 'WITHDRAWAL' ? (
                          <ArrowUpRight size={20} />
                        ) : (
                          <Zap size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{tx.type}</p>
                        <p className="text-xs text-zinc-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString()} USDT
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase">{tx.status}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-zinc-500 text-sm">No transactions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
