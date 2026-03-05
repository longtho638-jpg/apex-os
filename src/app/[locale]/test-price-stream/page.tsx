'use client';

import { Activity, Zap } from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { usePriceStream } from '@/hooks/usePriceStream';

export default function TestPriceStream() {
  const { connected, error, prices } = usePriceStream({
    symbols: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
  });

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Zap className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Price Stream Diagnostic</h1>
              <p className="text-xs text-zinc-400">WebSocket Connection Status</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-xs font-mono text-zinc-400">{connected ? 'CONNECTED' : 'DISCONNECTED'}</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {prices.length === 0 ? (
              <div className="col-span-full p-12 text-center text-zinc-500 border border-dashed border-white/10 rounded-xl">
                Waiting for price updates...
              </div>
            ) : (
              prices.map((priceData) => (
                <div
                  key={priceData.symbol}
                  className="p-4 border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{priceData.symbol}</h3>
                    <Activity className="w-4 h-4 text-zinc-500" />
                  </div>
                  <p className="text-3xl font-mono font-bold text-white tracking-tight">
                    ${priceData.price.toFixed(2)}
                  </p>
                  <div className="text-xs text-zinc-500 mt-3 flex justify-between font-mono">
                    <span>B: {priceData.bid.toFixed(2)}</span>
                    <span>A: {priceData.ask.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-[10px] text-gray-600 text-right">
                    {new Date(priceData.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
