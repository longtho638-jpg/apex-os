'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { LivePositionTracker } from '@/components/trading/LivePositionTracker';
import { QuickTradePanel } from '@/components/trading/QuickTradePanel';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useAuth } from '@/contexts/AuthContext'; // Client-side auth context

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const userId = user?.id || '';

  // If auth loading, show skeleton (or rely on layout)
  // Assuming AuthContext handles initial redirect if not logged in,
  // or the parent layout handles it.

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
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Activity className="h-7 w-7 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trading</h1>
                <p className="text-sm text-zinc-400">Manage your positions & orders</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              {['overview', 'positions', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </header>

          <div className="p-6 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-1">
                    <GlassCard className="p-4 h-full">
                      <QuickTradePanel userId={userId} />
                    </GlassCard>
                  </div>
                  <div className="lg:col-span-2">
                    <GlassCard className="p-4 h-full">
                      <LivePositionTracker userId={userId} />
                    </GlassCard>
                  </div>
                </motion.div>
              )}
              {activeTab === 'positions' && (
                <motion.div
                  key="positions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <GlassCard className="p-6">
                    <LivePositionTracker userId={userId} />
                  </GlassCard>
                </motion.div>
              )}
              {/* Add history tab later */}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
