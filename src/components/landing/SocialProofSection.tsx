'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { Users, TrendingUp, DollarSign, Shield } from 'lucide-react';

interface Stat {
  icon: typeof Users;
  label: string;
  value: string;
  color: string;
}

export function SocialProofSection() {
  const stats: Stat[] = [
    {
      icon: Users,
      label: 'Active Traders',
      value: '1,000+',
      color: 'text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'AI Signals Generated',
      value: '247',
      color: 'text-emerald-400',
    },
    {
      icon: DollarSign,
      label: 'Total Volume Traded',
      value: '$2.8M',
      color: 'text-purple-400',
    },
    {
      icon: Shield,
      label: 'Uptime',
      value: '99.9%',
      color: 'text-yellow-400',
    },
  ];

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Trusted by Traders Worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={idx} className="p-6 text-center hover:scale-105 transition-transform">
                <Icon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-400">{stat.label}</div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
