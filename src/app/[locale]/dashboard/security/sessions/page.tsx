'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Laptop, Smartphone, Globe, Trash2 } from 'lucide-react';

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  last_active: string;
  is_current: boolean;
}

export default function SessionManagerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    // Mock data
    setSessions([
        { id: '1', ip_address: '192.168.1.1', user_agent: 'Chrome (Mac OS)', last_active: new Date().toISOString(), is_current: true },
        { id: '2', ip_address: '10.0.0.1', user_agent: 'Safari (iPhone)', last_active: new Date(Date.now() - 3600000).toISOString(), is_current: false }
    ]);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto p-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Active Sessions</h1>
            <p className="text-zinc-400">Manage devices logged into your account.</p>
          </header>

          <div className="space-y-4 max-w-3xl">
            {sessions.map((session) => (
                <GlassCard key={session.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${session.is_current ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {session.user_agent.includes('iPhone') ? <Smartphone className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-bold flex items-center gap-2">
                                {session.user_agent}
                                {session.is_current && <span className="text-[10px] bg-emerald-500 px-2 py-0.5 rounded-full text-black">CURRENT</span>}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ip_address}</span>
                                <span>Last active: {new Date(session.last_active).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    {!session.is_current && (
                        <button className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </GlassCard>
            ))}

            <div className="flex justify-end mt-8">
                <button className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg font-bold transition-colors">
                    Revoke All Other Sessions
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
