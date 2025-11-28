'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy } from 'lucide-react';

export function PerformanceShowcase() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    day: i,
    value: 1000 + Math.pow(i, 1.5) * 10 + Math.random() * 500
  }));

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">System Performance</h3>
              <p className="text-sm text-zinc-400">Aggregate PnL (30 Days)</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">+142%</div>
              <div className="text-xs text-zinc-500">vs. BTC Hold</div>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                  labelStyle={{ display: 'none' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-yellow-400 w-5 h-5" /> Top Signals
            </h3>
            <div className="space-y-3">
              {[
                { sym: 'SOL/USDT', ret: '+14.2%', time: '2h ago' },
                { sym: 'ETH/USDT', ret: '+5.8%', time: '4h ago' },
                { sym: 'BTC/USDT', ret: '+3.1%', time: '6h ago' },
                { sym: 'BNB/USDT', ret: '+2.4%', time: '8h ago' },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                  <div>
                    <div className="font-bold text-sm text-white">{s.sym}</div>
                    <div className="text-xs text-zinc-500">{s.time}</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400">{s.ret}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/20 to-black border border-emerald-500/20 rounded-2xl p-6 text-center">
            <div className="text-sm text-zinc-400 mb-1">Total Volume Analyzed</div>
            <div className="text-3xl font-bold text-white">$4.2B+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
