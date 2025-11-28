'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [funnel, setFunnel] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [funnelRes, revenueRes] = await Promise.all([
            fetch('/api/admin/analytics/funnel'),
            fetch('/api/admin/analytics/revenue'),
        ]);
        
        if (funnelRes.ok) setFunnel(await funnelRes.json());
        if (revenueRes.ok) setRevenue(await revenueRes.json());
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
          <div />
        </AuroraBackground>
        
        <div className="relative z-10 h-full flex flex-col overflow-y-auto">
          <header className="sticky top-0 z-30 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 p-6">
            <h1 className="text-2xl font-bold">Revenue Analytics</h1>
            <p className="text-sm text-zinc-400">Real-time conversion & revenue metrics</p>
          </header>
          
          <div className="p-6 space-y-6">
            {loading ? (
                <div className="text-zinc-500 animate-pulse">Loading analytics data...</div>
            ) : (
                <>
                    {/* Revenue KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">MRR</span>
                        <DollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold">${revenue?.mrr || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">Monthly Recurring Revenue</div>
                    </GlassCard>
                    
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">ARR</span>
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold">${revenue?.arr || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">Annual Recurring Revenue</div>
                    </GlassCard>
                    
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">ARPU</span>
                        <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="text-3xl font-bold">${revenue?.arpu || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">Average Revenue Per User</div>
                    </GlassCard>
                    
                    <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">Paid Users</span>
                        <Target className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="text-3xl font-bold">{revenue?.paidUsers || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">Paying customers</div>
                    </GlassCard>
                    </div>
                    
                    {/* Conversion Funnel */}
                    <GlassCard className="p-6">
                    <h2 className="text-lg font-bold mb-4">Conversion Funnel (Last 30 Days)</h2>
                    <div className="space-y-4">
                        <div>
                        <div className="flex justify-between mb-2">
                            <span>Landing Views → Signup Started</span>
                            <span className="font-bold">{funnel?.conversionRates?.landingToSignup || 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                            className="h-full bg-emerald-500"
                            style={{ width: `${funnel?.conversionRates?.landingToSignup || 0}%` }}
                            />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {funnel?.funnel?.landingViews || 0} views → {funnel?.funnel?.signupStarted || 0} started
                        </div>
                        </div>
                        
                        <div>
                        <div className="flex justify-between mb-2">
                            <span>Signup Started → Completed</span>
                            <span className="font-bold">{funnel?.conversionRates?.signupCompletion || 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${funnel?.conversionRates?.signupCompletion || 0}%` }}
                            />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {funnel?.funnel?.signupStarted || 0} started → {funnel?.funnel?.signupCompleted || 0} completed
                        </div>
                        </div>
                        
                        <div>
                        <div className="flex justify-between mb-2">
                            <span>Free Trial → Paid</span>
                            <span className="font-bold text-emerald-400">{funnel?.conversionRates?.trialToPaid || 0}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                            <div 
                            className="h-full bg-purple-500"
                            style={{ width: `${funnel?.conversionRates?.trialToPaid || 0}%` }}
                            />
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {funnel?.funnel?.signupCompleted || 0} trials → {funnel?.funnel?.paymentCompleted || 0} paid
                        </div>
                        </div>
                    </div>
                    </GlassCard>
                </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
