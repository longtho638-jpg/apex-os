'use client';

import { ClipboardList } from 'lucide-react';
import { Sidebar } from '@/components/os/sidebar';
import { QuickTradePanel } from '@/components/trading/QuickTradePanel';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext';

export default function LimitOrdersPage() {
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
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <ClipboardList className="h-7 w-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Limit Orders</h1>
                <p className="text-sm text-zinc-400">Place and manage limit orders</p>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-2xl mx-auto w-full">
            <GlassCard className="p-6">
              <QuickTradePanel userId={userId} />
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
