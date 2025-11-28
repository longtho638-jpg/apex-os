'use client';

import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { Beaker, Plus, Play, Pause, BarChart2 } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';
import Link from 'next/link';

export default function ABTestsPage() {
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        
        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Beaker className="h-7 w-7 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">A/B Testing</h1>
                  <p className="text-sm text-zinc-400">Optimize conversion rates</p>
                </div>
              </div>
              <Link href="/en/admin/ab-tests/new">
                <Button3D className="px-4 py-2 text-sm">
                  <Plus className="w-4 h-4 mr-2 inline" /> New Test
                </Button3D>
              </Link>
            </div>
          </header>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Test Card */}
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">ID: EXP-{100+i}</span>
                    </div>
                    <h3 className="font-bold text-lg">Homepage Hero CTA</h3>
                  </div>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <Pause className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 my-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Variant A (Control)</span>
                    <span className="font-mono text-white">12.4% CR</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-500 w-[12%]" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Variant B</span>
                    <span className="font-mono text-emerald-400">15.8% CR</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[15.8%]" />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-zinc-500">
                  <span>2,450 Visitors</span>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <BarChart2 className="w-3 h-3" /> Details
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}