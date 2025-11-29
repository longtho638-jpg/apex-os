'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Users, Globe, Palette, BarChart } from 'lucide-react';

export default function PartnerDashboard() {
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Partner Portal</h1>
            <p className="text-zinc-400">Manage your White Label exchange.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Active Users</p>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-3xl font-bold">1,240</h3>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Total Volume</p>
                <BarChart className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold">$4.2M</h3>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex justify-between items-start mb-2">
                <p className="text-zinc-400 text-sm">Domain Status</p>
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-emerald-400">Active</h3>
              <p className="text-xs text-zinc-500">trade.partner.com</p>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-yellow-400" /> Branding Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Brand Name</label>
                    <input type="text" defaultValue="Partner Exchange" className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white" />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Primary Color (Hex)</label>
                    <div className="flex gap-2">
                        <input type="color" defaultValue="#10b981" className="h-10 w-10 rounded cursor-pointer bg-transparent border-0" />
                        <input type="text" defaultValue="#10b981" className="flex-1 bg-zinc-900 border border-white/10 rounded p-2 text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Logo URL</label>
                    <input type="text" defaultValue="https://partner.com/logo.png" className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white" />
                </div>
            </div>
            <button className="mt-6 px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200">
                Save Changes
            </button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
