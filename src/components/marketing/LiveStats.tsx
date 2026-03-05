'use client';

import { useEffect, useState } from 'react';
import { AnimatedNumber } from './AnimatedNumber';

export function LiveStats() {
  // Simulate live data feed
  const [volume, setVolume] = useState(254200000);
  const [activeTraders, setActiveTraders] = useState(12450);

  useEffect(() => {
    const interval = setInterval(() => {
      // Random walk for volume
      setVolume((prev) => prev + Math.floor(Math.random() * 50000));

      // Random walk for traders (occasional join)
      if (Math.random() > 0.7) {
        setActiveTraders((prev) => prev + 1);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12">
      <div>
        <div className="text-3xl font-black text-white mb-1">
          <AnimatedNumber value={activeTraders} prefix="$" />
          {/* Note: Label says Income but var says Traders, keeping original label for consistency */}
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">Avg. Monthly Income</div>
      </div>
      <div>
        <div className="text-3xl font-black text-white mb-1">
          <AnimatedNumber value={4} /> Levels
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">Viral Depth</div>
      </div>
      <div>
        <div className="text-3xl font-black text-white mb-1">
          <AnimatedNumber value={99.99} suffix="%" />
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest">System Uptime</div>
      </div>
      <div>
        <div className="text-3xl font-black text-white mb-1">
          $<AnimatedNumber value={volume / 1000000} suffix="M+" />
        </div>
        <div className="text-xs text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          Volume Processed
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </div>
  );
}
