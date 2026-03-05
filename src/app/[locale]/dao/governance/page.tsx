'use client';

import { CheckCircle2, Clock, ShieldCheck, Vote, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ConnectWallet } from '@/components/dao/ConnectWallet';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';
import { getSupabaseClientSide } from '@/lib/supabase';

// Initialize Supabase client (ensure env vars are set)
const supabase = getSupabaseClientSide();

interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected';
  votes_for: number;
  votes_against: number;
  ends_at: string;
}

export default function GovernancePage() {
  const t = useTranslations('DAO');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      const { data } = await supabase.from('dao_proposals').select('*').order('ends_at', { ascending: false });

      if (data) setProposals(data);
      setLoading(false);
    };
    fetchProposals();
  }, []);

  const [votingPower, setVotingPower] = useState(0);
  const { tier } = useUserTier();
  const { available } = useWallet();

  useEffect(() => {
    // Cross-Map: Voting Power = Wallet Balance * Tier Multiplier
    const multiplier = tier === 'SOVEREIGN' ? 3 : tier === 'ARCHITECT' ? 2 : 1;
    setVotingPower(Math.floor(available * multiplier));
  }, [available, tier]);

  const handleVote = (_id: string, type: 'for' | 'against') => {
    if (votingPower <= 0) {
      toast.error('You need to stake APEX to vote!');
      return;
    }

    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: 'Casting vote on-chain...',
      success: `Successfully voted ${type.toUpperCase()} with ${votingPower} VP!`,
      error: 'Vote failed',
    });
  };

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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {t('title')}
              </h1>
              <p className="text-zinc-400">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-zinc-400">Voting Power:</span>
                <span className="font-bold text-purple-400">{votingPower.toLocaleString()} VP</span>
                <span className="text-[10px] text-zinc-500 bg-purple-500/10 px-1 rounded">
                  {tier === 'SOVEREIGN' ? '3x' : tier === 'ARCHITECT' ? '2x' : '1x'} Boost
                </span>
              </div>
              <ConnectWallet />
            </div>
          </header>

          <div className="space-y-6 max-w-4xl">
            {proposals.map((proposal) => {
              const totalVotes = (proposal.votes_for || 0) + (proposal.votes_against || 0);
              const forPercent = totalVotes > 0 ? ((proposal.votes_for || 0) / totalVotes) * 100 : 0;
              const againstPercent = totalVotes > 0 ? ((proposal.votes_against || 0) / totalVotes) * 100 : 0;

              return (
                <GlassCard key={proposal.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            proposal.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : proposal.status === 'passed'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {proposal.status}
                        </span>
                        <span className="text-zinc-500 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {t('ends')} {new Date(proposal.ends_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{proposal.title}</h3>
                      <p className="text-zinc-400 text-sm">{proposal.description}</p>
                    </div>
                    <Vote className="w-6 h-6 text-zinc-600" />
                  </div>

                  {/* Voting Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-emerald-400">
                        {t('for')}: {forPercent.toFixed(1)}%
                      </span>
                      <span className="text-red-400">
                        {t('against')}: {againstPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                      <div style={{ width: `${forPercent}%` }} className="bg-emerald-500 h-full" />
                      <div style={{ width: `${againstPercent}%` }} className="bg-red-500 h-full" />
                    </div>
                  </div>

                  {/* Actions */}
                  {proposal.status === 'active' && (
                    <div className="flex gap-3 border-t border-white/5 pt-4">
                      <button
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {t('vote_for')}
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, 'against')}
                        className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-bold transition flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> {t('vote_against')}
                      </button>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
