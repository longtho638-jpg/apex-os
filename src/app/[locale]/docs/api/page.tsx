'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Terminal, Code, Shield, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            ApexOS Enterprise API
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Integrate institutional-grade AI signals directly into your exchange, wallet, or fund.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Secure Authentication"
            description="Bearer Token authentication with SHA-256 hashed keys and granular scopes."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6 text-emerald-400" />}
            title="Real-Time Latency"
            description="Signals delivered with <50ms latency via our optimized edge network."
          />
          <FeatureCard
            icon={<Code className="w-6 h-6 text-emerald-400" />}
            title="Developer Friendly"
            description="OpenAPI 3.0 spec, clear error messages, and easy-to-use SDKs."
          />
        </div>

        {/* Documentation Viewer Placeholder */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="bg-[#1e1e1e] p-4 flex items-center gap-2 border-b border-white/10">
            <Terminal className="w-5 h-5 text-zinc-400" />
            <span className="font-mono text-sm text-zinc-300">bash</span>
          </div>
          <div className="p-6 bg-[#0d0d0d] font-mono text-sm text-zinc-300 overflow-x-auto">
            <p className="mb-4 text-zinc-500"># Get latest signals</p>
            <p className="whitespace-pre">
              curl -X GET https://api.apexrebate.com/v1/signals/latest \<br />
              &nbsp;&nbsp;-H "Authorization: Bearer apx_live_..." \<br />
              &nbsp;&nbsp;-H "Content-Type: application/json"
            </p>

            <p className="mt-6 mb-4 text-zinc-500"># Response</p>
            <pre className="text-emerald-400">
              {`{
  "signals": [
    {
      "pair": "BTC/USDT",
      "action": "BUY",
      "price": 64250.00,
      "confidence": 0.89,
      "timestamp": "2025-11-28T10:30:00Z"
    }
  ]
}`}
            </pre>
          </div>
        </GlassCard>

        <div className="mt-12 text-center">
          <Link
            href="/contact-sales"
            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
          >
            Get API Access <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <GlassCard className="p-6">
      <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-zinc-400">{description}</p>
    </GlassCard>
  );
}
