'use client';

import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';

interface LegalPageProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export default function LegalPageLayout({ title, lastUpdated, children }: LegalPageProps) {
    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 font-sans relative">
            <ParticleBackground />
            <SiteHeader />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
                        <p className="text-zinc-500">Last Updated: {lastUpdated}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12 prose prose-invert prose-emerald max-w-none">
                        {children}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
