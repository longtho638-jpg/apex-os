'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { CheckCircle2, Circle, Gift } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  cta: string;
  ctaLink: string;
}

export function OnboardingChecklist({ userId }: { userId: string }) {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  async function fetchProgress() {
    try {
      const response = await fetch(`/api/user/onboarding?userId=${userId}`);
      if (!response.ok) return;
      
      const data = await response.json();

      const stepsData: OnboardingStep[] = [
        {
          id: 'connect_exchange',
          title: 'Connect Exchange',
          description: 'Link your Binance account for live trading',
          completed: data.step_connect_exchange || false,
          cta: 'Connect Now',
          ctaLink: '/settings#api-keys',
        },
        {
          id: 'view_signal',
          title: 'View a Signal',
          description: 'Check out trading signals from our AI',
          completed: data.step_view_signal || false,
          cta: 'View Signals',
          ctaLink: '/signals',
        },
        {
          id: 'execute_trade',
          title: 'Execute Your First Trade',
          description: 'Try paper trading or go live',
          completed: data.step_execute_trade || false,
          cta: 'Start Trading',
          ctaLink: '/trade',
        },
        {
          id: 'set_alerts',
          title: 'Set Up Alerts',
          description: 'Get notified of important market movements',
          completed: data.step_set_alerts || false,
          cta: 'Create Alert',
          ctaLink: '/alerts',
        },
        {
          id: 'refer_friend',
          title: 'Refer a Friend',
          description: 'Share your referral link and earn 20% commission',
          completed: data.step_refer_friend || false,
          cta: 'Get Link',
          ctaLink: '/referrals',
        },
      ];

      setSteps(stepsData);
      const completed = stepsData.filter((s) => s.completed).length;
      setTotalCompleted(completed);

      if (completed === 5 && !data.completed_at) {
        setShowReward(true);
        markAllCompleted();
      }
    } catch (error) {
      console.error("Failed to fetch onboarding progress", error);
    }
  }

  async function markAllCompleted() {
    try {
      await fetch('/api/user/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Failed to mark onboarding complete", error);
    }
  }

  const progress = (totalCompleted / 5) * 100;

  if (steps.length === 0) return null;

  return (
    <GlassCard className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">Get Started Checklist</h3>
          <p className="text-sm text-zinc-400">
            Complete all steps to unlock advanced features
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">
            {totalCompleted}/5
          </p>
          <p className="text-xs text-zinc-500">completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
        <div
          className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition ${
              step.completed
                ? 'border-emerald-400/20 bg-emerald-400/5'
                : 'border-white/10'
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            ) : (
              <Circle className="w-6 h-6 text-zinc-600 flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${step.completed ? 'line-through text-zinc-500' : ''}`}>
                {step.title}
              </p>
              <p className="text-sm text-zinc-400">{step.description}</p>
            </div>

            {!step.completed && (
              <a
                href={step.ctaLink}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-medium transition"
              >
                {step.cta}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Reward modal */}
      {showReward && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <GlassCard className="max-w-md p-8 text-center relative">
            <Gift className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Congratulations! 🎉</h2>
            <p className="text-zinc-400 mb-6">
              You&apos;ve completed all onboarding steps! Advanced features unlocked.
            </p>
            <button
              onClick={() => setShowReward(false)}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium"
            >
              Awesome!
            </button>
          </GlassCard>
        </div>
      )}
    </GlassCard>
  );
}
