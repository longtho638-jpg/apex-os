'use client';

import { BarChart, Globe, Lock, Palette, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserTier } from '@/hooks/useUserTier';

export default function PartnerDashboard() {
  const { isWhale, loading } = useUserTier();
  const router = useRouter();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  // Mock Real-time Commission Feed
  useEffect(() => {
    const interval = setInterval(() => {
      const newComm = {
        id: Date.now(),
        user: `User_${Math.floor(Math.random() * 1000)}`,
        amount: (Math.random() * 50).toFixed(2),
        time: new Date().toLocaleTimeString(),
      };
      setCommissions((prev) => [newComm, ...prev].slice(0, 5));
      setTotalEarned((prev) => prev + parseFloat(newComm.amount));
      toast.success(`💰 New Commission: +$${newComm.amount} from ${newComm.user}`);
    }, 8000); // Every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
      loading: 'Updating White Label settings...',
      success: 'Branding updated successfully!',
      error: 'Update failed',
    });
  };

  if (loading) return null;

  if (!isWhale) {
    return (
      <div className="flex h-screen w-full bg-[#030303] text-white font-sans items-center justify-center relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        <GlassCard className="p-12 max-w-lg text-center z-10 border-yellow-500/30">
          <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Partner Access Required</h1>
          <p className="text-zinc-400 mb-8">The White Label Exchange solution is exclusive to Whale tier partners.</p>
          <button
            onClick={() => router.push('/en/billing')}
            className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl font-bold transition-all shadow-lg shadow-yellow-500/20"
          >
            Upgrade to Whale
          </button>
        </GlassCard>
      </div>
    );
  }

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

          {/* Commission Feed */}
          <GlassCard className="p-6 mb-8 border-emerald-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart className="w-5 h-5 text-emerald-400" /> Live Commissions
              </h3>
              <div className="text-emerald-400 font-mono font-bold">Total: ${totalEarned.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              {commissions.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center py-4">Waiting for trades...</div>
              ) : (
                commissions.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-lg animate-in fade-in slide-in-from-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm text-white">{c.user}</span>
                    </div>
                    <div className="font-mono text-emerald-400 font-bold">+${c.amount}</div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-yellow-400" /> Branding Settings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Brand Name</label>
                <input
                  type="text"
                  defaultValue="Partner Exchange"
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Primary Color (Hex)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue="#10b981"
                    className="h-10 w-10 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    defaultValue="#10b981"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Logo URL</label>
                <input
                  type="text"
                  defaultValue="https://partner.com/logo.png"
                  className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-white"
                />
              </div>
            </div>
            <button
              onClick={handleSave}
              className="mt-6 px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200 transition-colors"
            >
              Save Changes
            </button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
