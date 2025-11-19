"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Activity, Layers, Terminal, TrendingUp, Users, Bot, FileText, ChevronRight, Sparkles, Brain, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import SynergyCore from '@/components/SynergyCore';

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans overflow-x-hidden selection:bg-[#00FF00]/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#00FF00] rounded-sm flex items-center justify-center shadow-[0_0_10px_rgba(0,255,0,0.5)]">
              <div className="h-4 w-4 bg-black transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tighter">
              APEX<span className="text-[#00FF00]">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-[#00FF00] text-black text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#00FF00]/90 transition-all shadow-[0_0_15px_rgba(0,255,0,0.3)] hover:shadow-[0_0_25px_rgba(0,255,0,0.5)]"
            >
              Request Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FF00]/10 via-[#0A0A0A] to-[#0A0A0A] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-[#00FF00] animate-pulse" />
              <span className="text-xs font-medium text-gray-300 tracking-wide uppercase">System Operational v2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
              The Agentic Infrastructure <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF00] to-emerald-600">
                for Pro Traders
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Automate your edge with institutional-grade AI agents.
              Real-time auditing, risk management, and rebate optimization in one operating system.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="group flex items-center gap-2 bg-[#00FF00] text-black text-lg font-bold px-8 py-4 rounded-xl hover:bg-[#00FF00]/90 transition-all shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)]"
              >
                Request Access
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-medium text-gray-300">
                <Terminal className="h-5 w-5" />
                View Documentation
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Ticker */}
      <div className="border-y border-white/5 bg-white/[0.02] overflow-hidden py-4">
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-lg font-bold font-mono text-gray-500">TRUSTED BY 50+ WHALES</span>
              <span className="text-[#00FF00]">•</span>
              <span className="text-lg font-bold font-mono text-gray-500">$10M+ VOLUME PROCESSED</span>
              <span className="text-[#00FF00]">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid (Bento) */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">The Wolf Pack</h2>
            <p className="text-gray-400">Four specialized agents working in concert to protect and grow your portfolio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Collector (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-[#00FF00]/30 transition-colors">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                    <Activity className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">The Collector</h3>
                  <p className="text-gray-400 max-w-md">
                    Real-time data aggregation from Binance, Bybit, and OKX.
                    Unifies your fragmented liquidity into a single, coherent dashboard with sub-millisecond latency.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-blue-400">
                  <span>Latency: 12ms</span>
                  <span>•</span>
                  <span>Uptime: 99.99%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Guardian */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-[#00FF00]/30 transition-colors">
              <div className="absolute top-0 right-0 p-24 bg-[#00FF00]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00FF00]/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-[#00FF00]/20 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-[#00FF00]" />
                </div>
                <h3 className="text-xl font-bold mb-2">The Guardian</h3>
                <p className="text-sm text-gray-400">
                  24/7 Risk Management. Monitors margin utilization and liquidation prices, alerting you before disaster strikes.
                </p>
              </div>
            </div>

            {/* Card 3: Auditor */}
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-[#00FF00]/30 transition-colors">
              <div className="absolute top-0 right-0 p-24 bg-yellow-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-all duration-500" />
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">The Auditor</h3>
                <p className="text-sm text-gray-400">
                  Fee & Rebate Reconciliation. Automatically verifies every trade execution against exchange fee tiers to ensure you get paid correctly.
                </p>
              </div>
            </div>

            {/* Card 4: Concierge (Large) */}
            <div className="md:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-8 relative overflow-hidden group hover:border-[#00FF00]/30 transition-colors">
              <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                    <Layers className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">The Concierge</h3>
                  <p className="text-gray-400 max-w-md">
                    Your personal interface to the Apex ecosystem. Handles reporting, settings, and system orchestration through a natural language interface.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-purple-400">
                  <Terminal className="h-4 w-4" />
                  <span>Ready for command input...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-[#00FF00] rounded-sm flex items-center justify-center">
              <div className="h-3 w-3 bg-black transform rotate-45" />
            </div>
            <span className="text-lg font-bold tracking-tighter">
              APEX<span className="text-[#00FF00]">OS</span>
            </span>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 Apex Financial Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

{/* THE SYNERGY CORE SECTION */ }
<section className="relative py-32 px-4">
  <div className="max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h2 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00FF00] to-white">
        The Power of Collective
      </h2>
      <p className="text-xl text-gray-400 max-w-3xl mx-auto">
        Every trader who joins strengthens the entire network.
        <br />
        <span className="text-[#00FF00]">One person in. The whole village benefits.</span>
      </p>
    </motion.div>

    <SynergyCore />

    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      viewport={{ once: true }}
      className="mt-12 text-center"
    >
      <p className="text-gray-400 mb-6">
        As our collective volume grows, <span className="text-[#00FF00] font-semibold">everyone</span> unlocks:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-black/50 border border-[#00FF00]/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-lg font-semibold text-[#00FF00] mb-2">Lower Fees</div>
          <div className="text-sm text-gray-400">VIP tiers unlock at volume milestones</div>
        </div>
        <div className="bg-black/50 border border-[#00FF00]/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl mb-2">🤖</div>
          <div className="text-lg font-semibold text-[#00FF00] mb-2">Advanced AI</div>
          <div className="text-sm text-gray-400">More data = smarter Guardian predictions</div>
        </div>
        <div className="bg-black/50 border border-[#00FF00]/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-3xl mb-2">🌐</div>
          <div className="text-lg font-semibold text-[#00FF00] mb-2">Network Access</div>
          <div className="text-sm text-gray-400">Connect with whales & alpha sources</div>
        </div>
      </div>
    </motion.div>
  </div>
</section>
