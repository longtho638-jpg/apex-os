'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Download, Copy, Twitter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const SWIPE_COPY = [
    {
        id: 1,
        title: "The 'Secret Weapon' Tweet",
        content: "Just discovered this AI trading tool called ApexOS. 🤖\n\nIt tracks whales and auto-trades for you. My win rate went from 45% -> 72% in a week.\n\nTry the free trial here: [LINK] #crypto #trading #AI"
    },
    {
        id: 2,
        title: "The FOMO Tweet",
        content: "While you were sleeping, ApexOS farmed $420 in arbitrage profits for me. 💸\n\nDon't trade manually. Automate it.\n\nGet 20% off with my code: [CODE]\n[LINK]"
    }
];

export default function AffiliateAssetsPage() {
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <Link href="/affiliate/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-4">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white">Marketing Assets</h1>
            <p className="text-zinc-400">Everything you need to promote ApexOS.</p>
          </header>

          <div className="grid gap-8">
            <section>
                <h2 className="text-xl font-bold mb-4">Swipe Copy (Tweets/Emails)</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {SWIPE_COPY.map((item) => (
                        <GlassCard key={item.id} className="p-6">
                            <h3 className="font-bold mb-3 text-emerald-400">{item.title}</h3>
                            <div className="bg-black/30 p-4 rounded-lg border border-white/5 mb-4 min-h-[120px] text-sm text-zinc-300 whitespace-pre-wrap">
                                {item.content}
                            </div>
                            <button 
                                onClick={() => navigator.clipboard.writeText(item.content)}
                                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                                <Copy className="w-4 h-4" /> Copy Text
                            </button>
                        </GlassCard>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4">Banners & Graphics</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <GlassCard key={i} className="p-4">
                            <div className="aspect-video bg-zinc-800 rounded-lg mb-4 flex items-center justify-center border border-white/5">
                                <span className="text-zinc-600">Banner Preview {i}</span>
                            </div>
                            <button className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg flex items-center justify-center gap-2 font-bold text-black transition-colors">
                                <Download className="w-4 h-4" /> Download
                            </button>
                        </GlassCard>
                    ))}
                </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
