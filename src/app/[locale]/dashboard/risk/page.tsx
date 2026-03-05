'use client';

import { AlertTriangle, Shield, Sliders } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { toast } from 'sonner';
import { RiskAlertsWidget } from '@/components/dashboard/RiskAlertsWidget';
import { Sidebar } from '@/components/os/sidebar';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useRisk } from '@/hooks/useRisk';
import { useUserTier } from '@/hooks/useUserTier';
import { useWallet } from '@/hooks/useWallet';

// --- Sub-components for better readability & performance ---

const PortfolioHealth = memo(() => {
  const { status, dailyLoss, maxDrawdown } = useRisk();
  const percentage = Math.min((Math.abs(dailyLoss) / maxDrawdown) * 100, 100);

  return (
    <Card className="border-white/10 bg-black/40">
      <CardHeader>
        <CardTitle className="text-sm font-bold text-white">Portfolio Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <span className="text-zinc-400 text-sm">Current Status</span>
          <span
            className={`font-bold px-3 py-1 rounded-full text-xs border ${
              status === 'HEALTHY'
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : status === 'WARNING'
                  ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Daily Loss / Limit</span>
            <span>
              ${Math.abs(dailyLoss).toFixed(2)} / ${maxDrawdown}
            </span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                status === 'CRITICAL' ? 'bg-red-500' : status === 'WARNING' ? 'bg-yellow-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
PortfolioHealth.displayName = 'PortfolioHealth';

const SafetySettings = memo(() => {
  const [autoStopLoss, setAutoStopLoss] = useState(true);
  const [maxDrawdownInput, setMaxDrawdownInput] = useState(10);
  const [emergencyLock, setEmergencyLock] = useState(false);
  const { user } = useAuth();

  const handleEmergencyLockdown = async (checked: boolean) => {
    setEmergencyLock(checked);
    if (checked) {
      // Simulate API call to cancel all orders
      const toastId = toast.loading('INITIATING EMERGENCY LOCKDOWN...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.dismiss(toastId);
      toast.error('LOCKDOWN ACTIVE', {
        description: 'All open orders cancelled. Trading suspended.',
      });
    } else {
      toast.success('Lockdown Lifted', {
        description: 'Trading functionality restored.',
      });
    }
  };

  return (
    <Card className="border-white/10 bg-black/40">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Safety Settings
          </CardTitle>
          <Switch checked={autoStopLoss} onCheckedChange={setAutoStopLoss} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drawdown Slider */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm text-zinc-300">Max Daily Drawdown</label>
            <span className="text-red-400 font-bold">{maxDrawdownInput}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={maxDrawdownInput}
            onChange={(e) => setMaxDrawdownInput(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
            disabled={!autoStopLoss}
          />
          <p className="text-xs text-zinc-500 mt-2">
            Trigger: If portfolio drops by {maxDrawdownInput}% in 24h, all positions will close.
          </p>
        </div>

        {/* Emergency Toggle */}
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${emergencyLock ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/5 border-yellow-500/10'}`}
        >
          <AlertTriangle
            className={`w-5 h-5 shrink-0 ${emergencyLock ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}
          />
          <div className="text-xs text-zinc-400 flex-1">
            <strong className={`block mb-1 ${emergencyLock ? 'text-red-500' : 'text-yellow-500'}`}>
              {emergencyLock ? 'LOCKDOWN ACTIVE' : 'Emergency Lockdown'}
            </strong>
            {emergencyLock
              ? 'Trading suspended. Contact support to unlock.'
              : 'Prevent new orders if market volatility exceeds 10%.'}
          </div>
          <Switch
            checked={emergencyLock}
            onCheckedChange={handleEmergencyLockdown}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </CardContent>
    </Card>
  );
});
SafetySettings.displayName = 'SafetySettings';

// --- Main Page Component ---

export default function RiskPage() {
  const { tier, loading } = useUserTier();
  const { available } = useWallet();
  const router = useRouter();

  if (loading) return null;

  if (tier === 'EXPLORER') {
    return (
      <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          <AuroraBackground className="absolute inset-0 z-0 pointer-events-none">
            <div />
          </AuroraBackground>
          <GlassCard className="p-12 max-w-lg text-center z-10 border-red-500/30">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Risk Guardian Locked</h1>
            <p className="text-zinc-400 mb-8">
              Automated risk protection unlocks at Operator tier ($10K+ monthly volume).
            </p>
            <button
              onClick={() => router.push('/en/pricing')}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
            >
              Increase Volume to Unlock
            </button>
          </GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative custom-scrollbar">
        <header className="sticky top-0 z-20 bg-black/50 backdrop-blur-md border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <Shield className="w-6 h-6 text-red-500" />
              Risk Guardian
            </h1>
            <p className="text-xs text-zinc-400">Automated protection system</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-zinc-500">Wallet Balance</div>
              <div className={`font-bold ${available < 1000 ? 'text-red-400' : 'text-emerald-400'}`}>
                ${available.toLocaleString()}
              </div>
            </div>
            {available < 1000 && (
              <button
                onClick={() => router.push('/en/dashboard/wallet')}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20"
              >
                Deposit to Lower Risk
              </button>
            )}
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioHealth />
            <SafetySettings />
          </div>

          {/* Right Column: Alerts */}
          <div className="lg:col-span-1 h-full min-h-[400px]">
            <RiskAlertsWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
