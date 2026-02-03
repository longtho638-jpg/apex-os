'use client';

import { logger } from '@/lib/logger';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';

interface CohortData {
  week: string;
  signups: number;
  day1_retention: string;
  day7_retention: string;
  day30_retention: string;
  revenue: number;
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics/cohorts')
      .then(res => res.json())
      .then(data => {
        setCohorts(data.cohorts || []);
        setLoading(false);
      })
      .catch(err => {
          logger.error("Failed to fetch cohorts", err);
          setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>

        <div className="relative z-10 h-full overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <h1 className="text-2xl font-bold">Cohort Analysis</h1>
            <p className="text-sm text-zinc-400">User retention by signup week</p>
          </header>

          <div className="p-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold mb-4">Retention Cohorts</h2>
              {loading ? (
                <div className="text-center py-10 text-zinc-400">Loading cohorts...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-3 text-zinc-400 font-medium">Week</th>
                        <th className="text-right p-3 text-zinc-400 font-medium">Signups</th>
                        <th className="text-right p-3 text-zinc-400 font-medium">Day 1</th>
                        <th className="text-right p-3 text-zinc-400 font-medium">Day 7</th>
                        <th className="text-right p-3 text-zinc-400 font-medium">Day 30</th>
                        <th className="text-right p-3 text-zinc-400 font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohorts.map(cohort => (
                        <tr key={cohort.week} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 font-mono text-sm">{cohort.week}</td>
                          <td className="text-right p-3">{cohort.signups}</td>
                          <td className="text-right p-3">
                            <span className={`${parseFloat(cohort.day1_retention) > 50 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                              {cohort.day1_retention}%
                            </span>
                          </td>
                          <td className="text-right p-3">
                            <span className={`${parseFloat(cohort.day7_retention) > 20 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                              {cohort.day7_retention}%
                            </span>
                          </td>
                          <td className="text-right p-3">
                            <span className={`${parseFloat(cohort.day30_retention) > 10 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                              {cohort.day30_retention}%
                            </span>
                          </td>
                          <td className="text-right p-3 text-emerald-400 font-mono">${cohort.revenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
