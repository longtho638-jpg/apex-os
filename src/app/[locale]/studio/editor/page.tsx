'use client';

import AlgoStudioEditor from '@/components/studio/AlgoStudioEditor';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { useUserTier } from '@/hooks/useUserTier';
import { Lock, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { tier, canUseAgent } = useUserTier();
  const router = useRouter();

  const handlePublish = () => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
      loading: 'Compiling Strategy...',
      success: 'Strategy Published to Marketplace! 🚀',
      error: 'Compilation Failed'
    });
  };

  if (!canUseAgent()) {
    return (
      <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <AuroraBackground className="absolute inset-0 z-0 pointer-events-none"><div /></AuroraBackground>
          <div className="z-10 text-center p-8 glass-card max-w-md">
            <Lock className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-zinc-400 mb-6">The Algo Studio is reserved for TRADER tier and above.</p>
            <button
              onClick={() => router.push('/pricing')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-bold transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#030303]/50 backdrop-blur-md z-10">
          <h1 className="font-bold text-lg">Apex Algo Studio</h1>
          <button
            onClick={handlePublish}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm font-bold transition-all border border-purple-500/30"
          >
            <UploadCloud className="w-4 h-4" /> Publish Strategy
          </button>
        </header>
        <div className="flex-1 overflow-hidden">
          <AlgoStudioEditor />
        </div>
      </main>
    </div>
  );
}