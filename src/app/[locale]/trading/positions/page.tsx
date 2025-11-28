'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { LivePositionTracker } from '@/components/trading/LivePositionTracker';
import { useAuth } from '@/contexts/AuthContext';
import { Layers } from 'lucide-react';

export default function PositionsPage() {
  const { user } = useAuth();
  const userId = user?.id || '';

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        
        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Layers className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Active Positions</h1>
                <p className="text-sm text-zinc-400">Monitor your open trades</p>
              </div>
            </div>
          </header>

          <div className="p-6">
            <GlassCard className="p-6">
                <LivePositionTracker userId={userId} />
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}