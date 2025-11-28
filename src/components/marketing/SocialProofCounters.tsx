'use client';

import { useEffect, useState } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { Users, Zap, TrendingUp, Activity } from 'lucide-react';

export function SocialProofCounters() {
  // Mock stats
  const stats = [
    {
        label: 'Active Traders',
        value: 2450,
        suffix: '+',
        icon: Users,
        color: 'text-blue-400'
    },
    {
        label: 'Signals Generated',
        value: 14200,
        suffix: '',
        icon: Zap,
        color: 'text-yellow-400'
    },
    {
        label: 'Avg. Win Rate',
        value: 78,
        suffix: '%',
        icon: TrendingUp,
        color: 'text-emerald-400'
    },
    {
        label: 'Volume Analyzed',
        value: 850,
        suffix: 'M+',
        icon: Activity,
        color: 'text-purple-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto mt-12">
        {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center text-center group hover:bg-white/10 transition-colors">
                <div className={`mb-2 p-2 rounded-lg bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    {stat.label}
                </div>
            </div>
        ))}
    </div>
  );
}
