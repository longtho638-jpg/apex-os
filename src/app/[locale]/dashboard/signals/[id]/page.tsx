'use client';

import { formatDistanceToNow } from 'date-fns';
import { Activity, ArrowLeft, BarChart2, Zap } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';

export default function SignalDetailPage({ params }: { params: { id: string } }) {
  const [signal, setSignal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClientSide();

  useEffect(() => {
    async function fetchSignal() {
      const { data, error } = await supabase.from('trading_signals').select('*').eq('id', params.id).single();

      if (error || !data) {
        // handle error or 404
      } else {
        setSignal(data);
      }
      setLoading(false);
    }
    fetchSignal();
  }, [params.id, supabase]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading signal logic...</div>;
  if (!signal) return notFound();

  return (
    <div className="min-h-screen bg-[#030303] text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/en/dashboard/signals"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Signals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Signal Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    {signal.symbol}
                    <span
                      className={`px-3 py-1 rounded-lg text-lg ${signal.prediction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {signal.prediction}
                    </span>
                  </h1>
                  <p className="text-zinc-400 flex items-center gap-2">
                    <Activity size={16} /> Generated {formatDistanceToNow(new Date(signal.timestamp))} ago
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white tracking-tight">
                    {(signal.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">AI Confidence</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-white/5 border-b">
                <div>
                  <div className="text-xs text-zinc-500 uppercase mb-1">Entry Price</div>
                  <div className="text-2xl font-mono">${signal.entry_price?.toFixed(2)}</div>
                </div>
                {/* Stop Loss / Take Profit could be added if stored */}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" /> AI Reasoning
                </h3>
                <div className="prose prose-invert max-w-none">
                  <p className="text-zinc-300 leading-relaxed">
                    The ensemble model detected a strong {signal.prediction} opportunity based on a convergence of
                    Technical Price Action ({Math.round(signal.price_contrib * 100)}%), Social Sentiment (
                    {Math.round(signal.sentiment_contrib * 100)}%), and On-Chain Volume (
                    {Math.round(signal.volume_contrib * 100)}%).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Breakdown */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-bold mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-400" /> Signal Weights
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Price Model', val: signal.price_contrib, color: 'bg-blue-500' },
                  { label: 'Sentiment', val: signal.sentiment_contrib, color: 'bg-purple-500' },
                  { label: 'Volume/Whale', val: signal.volume_contrib, color: 'bg-orange-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-400">{item.label}</span>
                      <span className="text-white font-mono">{(item.val * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.val * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
