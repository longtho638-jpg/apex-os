'use client';

import { ArrowRight, Beaker } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button3D } from '@/components/marketing/Button3D';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';

export default function NewABTestPage() {
  const [step, setStep] = useState(1);

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
                <Link href="/en/admin/ab-tests" className="p-3 hover:bg-white/5 rounded-xl transition-colors">
                  <Beaker className="h-7 w-7 text-purple-400" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Create New Experiment</h1>
                  <p className="text-sm text-zinc-400">Step {step} of 3</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button3D variant="glass" className="px-6">
                  Draft
                </Button3D>
                <Button3D className="px-6">Launch</Button3D>
              </div>
            </div>
          </header>

          <div className="p-6 max-w-4xl mx-auto w-full">
            <GlassCard className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Experiment Name</label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                    placeholder="e.g. Pricing Page CTA Color"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Target Page</label>
                    <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none transition-colors">
                      <option>/landing</option>
                      <option>/pricing</option>
                      <option>/dashboard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Traffic Allocation</label>
                    <input
                      type="range"
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 mt-4"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                      <span>10%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <Button3D onClick={() => setStep(step + 1)}>
                    Next Step <ArrowRight className="ml-2 w-4 h-4 inline" />
                  </Button3D>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
