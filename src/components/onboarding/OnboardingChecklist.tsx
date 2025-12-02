'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Trophy, ArrowRight, Wallet, LineChart, PlayCircle, MessageCircle, Gift } from 'lucide-react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { useTranslations } from 'next-intl';

// Initialize Supabase client
const supabase = getSupabaseClientSide();

interface OnboardingState {
  step_connect_wallet: boolean;
  step_view_signal: boolean;
  step_run_backtest: boolean;
  step_join_telegram: boolean;
  step_refer_friend: boolean;
  reward_claimed: boolean;
}

export function OnboardingChecklist() {
  const t = useTranslations('Onboarding');
  const [state, setState] = useState<OnboardingState>({
    step_connect_wallet: false,
    step_view_signal: false,
    step_run_backtest: false,
    step_join_telegram: false,
    step_refer_friend: false,
    reward_claimed: false
  });
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding:', error);
        return;
      }

      if (data) {
        setState(data);
        if (data.reward_claimed) setIsOpen(false);
      } else {
        // Initialize if not exists
        await supabase.from('user_onboarding').insert({ user_id: user.id });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStep = async (step: keyof OnboardingState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_onboarding')
        .update({ [step]: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({ ...prev, [step]: true }));
      toast.success(t('task_completed'));

      // Check if all steps completed
      const newState = { ...state, [step]: true };
      const allCompleted = Object.keys(newState)
        .filter(k => k.startsWith('step_'))
        .every(k => newState[k as keyof OnboardingState]);

      if (allCompleted && !newState.reward_claimed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const claimReward = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_onboarding')
        .update({ reward_claimed: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({ ...prev, reward_claimed: true }));
      toast.success(t('reward_claimed'));
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to claim reward');
    }
  };

  const steps = [
    { key: 'step_connect_wallet', label: t('connect_wallet'), icon: Wallet, action: () => updateStep('step_connect_wallet') }, // In real app, this would be triggered by actual wallet connection
    { key: 'step_view_signal', label: t('view_signal'), icon: LineChart, action: () => updateStep('step_view_signal') },
    { key: 'step_run_backtest', label: t('run_backtest'), icon: PlayCircle, action: () => updateStep('step_run_backtest') },
    { key: 'step_join_telegram', label: t('join_telegram'), icon: MessageCircle, action: () => { window.open('https://t.me/apex_os', '_blank'); updateStep('step_join_telegram'); } },
  ];

  const completedCount = steps.filter(s => state[s.key as keyof OnboardingState]).length;
  const progress = (completedCount / steps.length) * 100;
  const allCompleted = completedCount === steps.length;

  if (loading || state.reward_claimed || !isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 w-80 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-emerald-900/50 to-black border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="font-bold text-white">{t('setup_guide')}</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">×</button>
      </div>

      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{completedCount}/{steps.length} {t('completed')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-3">
        {steps.map((step) => {
          const isCompleted = state[step.key as keyof OnboardingState];
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              onClick={!isCompleted ? step.action : undefined}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isCompleted ? 'opacity-50 cursor-default' : 'hover:bg-white/5 cursor-pointer'}`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-zinc-600 shrink-0" />
              )}
              <div className="flex-1">
                <div className={`text-sm font-medium ${isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {step.label}
                </div>
              </div>
              {!isCompleted && <ArrowRight className="h-4 w-4 text-zinc-600" />}
            </div>
          );
        })}
      </div>

      {/* Reward Action */}
      <AnimatePresence>
        {allCompleted && !state.reward_claimed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-emerald-500/10 border-t border-emerald-500/20 p-4"
          >
            <button
              onClick={claimReward}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Gift className="h-4 w-4" />
              {t('claim_reward')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
