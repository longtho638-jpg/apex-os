'use client';

import { motion } from 'framer-motion';
import { ChevronRight, FileText, Search, Shield, Terminal, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button3D } from '@/components/marketing/Button3D';
import { ParticleBackground } from '@/components/marketing/ParticleBackground';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { SiteHeader } from '@/components/marketing/SiteHeader';

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      title: 'Getting Started',
      icon: Zap,
      description: 'Learn the basics of ApexOS and set up your account.',
      links: ['Quick Start Guide', 'Connecting Exchanges', 'Understanding Tiers'],
    },
    {
      title: 'API Reference',
      icon: Terminal,
      description: 'Integrate your strategies with our high-frequency API.',
      links: ['Authentication', 'WebSocket Feed', 'Order Execution'],
    },
    {
      title: 'Trading Engine',
      icon: TrendingUpIcon,
      description: 'Deep dive into our execution algorithms and smart routing.',
      links: ['Smart Order Routing', 'Latency Optimization', 'Risk Controls'],
    },
    {
      title: 'Security & FAQ',
      icon: Shield,
      description: 'How we keep your funds and data safe.',
      links: ['Security Architecture', 'API Key Management', 'Common Questions'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-emerald-500/30 font-sans relative">
      <ParticleBackground />
      <SiteHeader />

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Search */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Documentation <span className="text-emerald-400">Hub</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Everything you need to build your trading empire on ApexOS.
            </p>

            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-emerald-500/50 focus-within:bg-black/50 transition-all">
                <Search className="w-6 h-6 text-zinc-500 ml-4" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-white placeholder-zinc-500 outline-none"
                />
                <div className="hidden sm:flex items-center gap-2 px-4 text-xs text-zinc-500 border-l border-white/10">
                  <span className="bg-white/10 px-2 py-1 rounded">⌘</span>
                  <span>K</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 hover:bg-white/[0.07] transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-8 h-8" />
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{cat.title}</h2>
              <p className="text-zinc-400 mb-8 h-12">{cat.description}</p>

              <ul className="space-y-3">
                {cat.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400 transition-colors text-sm font-medium"
                    >
                      <FileText className="w-4 h-4 opacity-50" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Developer CTA */}
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-12 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to build?</h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
                Get your API keys and start building custom trading strategies in minutes.
              </p>
              <div className="flex justify-center gap-4">
                <Button3D onClick={() => {}} className="px-8">
                  Get API Keys
                </Button3D>
                <Button3D variant="glass" onClick={() => {}} className="px-8">
                  View API Status
                </Button3D>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
