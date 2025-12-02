'use client';

import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { Search, MessageCircle, FileText, Zap, Mail } from 'lucide-react';
import { Button3D } from '@/components/marketing/Button3D';

export default function SupportPage() {
    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 font-sans relative">
            <ParticleBackground />
            <SiteHeader />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Hero */}
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">How can we help?</h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full bg-white/10 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-20">
                    {[
                        { icon: Zap, title: 'Getting Started', desc: 'Account setup, verification, and first deposit.' },
                        { icon: ActivityIcon, title: 'Trading & Orders', desc: 'Order types, fees, and execution logic.' },
                        { icon: CodeIcon, title: 'API & Devs', desc: 'API keys, rate limits, and SDKs.' }
                    ].map((cat, i) => (
                        <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-colors cursor-pointer group">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                                <cat.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                            <p className="text-zinc-400">{cat.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
                        <p className="text-zinc-400 mb-8">Our support team is available 24/7 to assist you.</p>
                        <div className="flex justify-center gap-4">
                            <Button3D onClick={() => { }}>
                                <MessageCircle className="w-4 h-4 mr-2 inline" />
                                Live Chat
                            </Button3D>
                            <Button3D variant="glass" onClick={() => { }}>
                                <Mail className="w-4 h-4 mr-2 inline" />
                                Email Support
                            </Button3D>
                        </div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}

function ActivityIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
    )
}

function CodeIcon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
    )
}
