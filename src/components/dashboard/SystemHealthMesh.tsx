'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export function SystemHealthMesh() {
  const [health, setHealth] = useState({ status: 'healthy', uptime: '99.99%' });

  return (
    <GlassCard className="p-4 bg-emerald-900/10 border-emerald-500/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Self-Healing Mesh
        </h3>
        <span className="text-xs bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 animate-pulse">
            ACTIVE
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-black/20 p-2 rounded">
            <p className="text-zinc-500">Uptime</p>
            <p className="font-mono font-bold text-white">99.99%</p>
        </div>
        <div className="bg-black/20 p-2 rounded">
            <p className="text-zinc-500">Latency</p>
            <p className="font-mono font-bold text-white">12ms</p>
        </div>
        <div className="bg-black/20 p-2 rounded">
            <p className="text-zinc-500">Nodes</p>
            <p className="font-mono font-bold text-white">12/12</p>
        </div>
      </div>
    </GlassCard>
  );
}
