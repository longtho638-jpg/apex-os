'use client';

import { getTierByVolume, RAAS_CONFIG, type TierId, UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  ChevronRight,
  Loader2,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button3D } from '@/components/marketing/Button3D';

type OnboardingStep = (typeof RAAS_CONFIG.agenticOnboarding.steps)[number];

interface RiskProfile {
  experience: 'beginner' | 'intermediate' | 'advanced' | 'institutional';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  monthlyBudget: number;
  preferredAssets: string[];
}

const STEP_ICONS: Record<OnboardingStep, typeof Bot> = {
  profile: Brain,
  'risk-assessment': Shield,
  'agent-config': Bot,
  funding: Wallet,
};

/**
 * AgenticOnboardingWizard — AI-driven onboarding flow
 *
 * RaaS agentic onboarding flow:
 * 1. AI profiles user in 3 questions (no long forms)
 * 2. Auto-detects optimal tier based on stated volume
 * 3. Deploys trading agents matching risk profile
 * 4. Crypto-native funding with zero deposit fees
 */
export function AgenticOnboardingWizard() {
  const router = useRouter();
  const t = useTranslations('Onboarding');
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [profile, setProfile] = useState<RiskProfile>({
    experience: 'beginner',
    riskTolerance: 'moderate',
    monthlyBudget: 1000,
    preferredAssets: ['BTC', 'ETH'],
  });
  const [detectedTier, setDetectedTier] = useState<TierId>('EXPLORER');
  const [deploying, setDeploying] = useState(false);
  const [deployedAgents, setDeployedAgents] = useState<string[]>([]);

  const stepIndex = RAAS_CONFIG.agenticOnboarding.steps.indexOf(currentStep);
  const StepIcon = STEP_ICONS[currentStep];

  const handleProfileComplete = () => {
    const tier = getTierByVolume(profile.monthlyBudget * 10);
    setDetectedTier(tier);
    setCurrentStep('risk-assessment');
  };

  const handleRiskComplete = () => {
    setCurrentStep('agent-config');
    deployAgents();
  };

  const deployAgents = async () => {
    setDeploying(true);
    const tierConfig = UNIFIED_TIERS[detectedTier];
    const agents = [...tierConfig.agentTypes];

    for (let i = 0; i < agents.length; i++) {
      await new Promise((r) => setTimeout(r, 800));
      setDeployedAgents((prev) => [...prev, agents[i]]);
    }

    setDeploying(false);
  };

  const handleFundingComplete = () => {
    router.push('/trade');
  };

  const nextStep = () => {
    const steps = RAAS_CONFIG.agenticOnboarding.steps;
    const nextIdx = stepIndex + 1;
    if (nextIdx < steps.length) {
      setCurrentStep(steps[nextIdx]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {RAAS_CONFIG.agenticOnboarding.steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i <= stepIndex ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'}
            `}
            >
              {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            {i < RAAS_CONFIG.agenticOnboarding.steps.length - 1 && (
              <div className={`h-px flex-1 ${i < stepIndex ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <StepIcon className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t(`steps.${currentStep}.title`)}</h2>
        <p className="text-zinc-400">{t(`steps.${currentStep}.subtitle`)}</p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          {currentStep === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">{t('profile.experience')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['beginner', 'intermediate', 'advanced', 'institutional'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setProfile((p) => ({ ...p, experience: level }))}
                      className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        profile.experience === level
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">{t('profile.monthly_volume')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[1000, 10000, 100000, 1000000].map((vol) => (
                    <button
                      key={vol}
                      onClick={() => setProfile((p) => ({ ...p, monthlyBudget: vol }))}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        profile.monthlyBudget === vol
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      ${vol >= 1000000 ? `${vol / 1000000}M` : vol >= 1000 ? `${vol / 1000}K` : vol}
                    </button>
                  ))}
                </div>
              </div>

              <Button3D full onClick={handleProfileComplete}>
                {t('actions.continue')} <ChevronRight className="inline w-4 h-4 ml-1" />
              </Button3D>
            </div>
          )}

          {currentStep === 'risk-assessment' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white">
                    {t('risk.detected', { tier: UNIFIED_TIERS[detectedTier].name })}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  {t('risk.qualify', {
                    volume: `$${profile.monthlyBudget.toLocaleString()}`,
                    spread: `${UNIFIED_TIERS[detectedTier].spreadBps / 100}%`,
                    agents: String(UNIFIED_TIERS[detectedTier].agentSlots),
                  })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">{t('risk.tolerance')}</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['conservative', 'moderate', 'aggressive'] as const).map((risk) => (
                    <button
                      key={risk}
                      onClick={() => setProfile((p) => ({ ...p, riskTolerance: risk }))}
                      className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        profile.riskTolerance === risk
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {risk}
                    </button>
                  ))}
                </div>
              </div>

              <Button3D full onClick={handleRiskComplete}>
                {t('actions.deploy_agents')} <Bot className="inline w-4 h-4 ml-1" />
              </Button3D>
            </div>
          )}

          {currentStep === 'agent-config' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {UNIFIED_TIERS[detectedTier].agentTypes.map((agent, i) => {
                  const isDeployed = deployedAgents.includes(agent);
                  return (
                    <motion.div
                      key={agent}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isDeployed ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900/50'
                      }`}
                    >
                      {isDeployed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : deploying ? (
                        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                      ) : (
                        <Bot className="w-5 h-5 text-zinc-600" />
                      )}
                      <span className={`text-sm font-medium capitalize ${isDeployed ? 'text-white' : 'text-zinc-500'}`}>
                        {agent.replace(/-/g, ' ')}
                      </span>
                      {isDeployed && (
                        <span className="ml-auto text-xs text-emerald-400 font-bold">{t('agents.live')}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {!deploying && deployedAgents.length > 0 && (
                <Button3D full onClick={nextStep}>
                  {t('actions.fund_and_trade')} <ArrowRight className="inline w-4 h-4 ml-1" />
                </Button3D>
              )}
            </div>
          )}

          {currentStep === 'funding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {RAAS_CONFIG.cryptoGate.stablecoins.map((coin) => (
                  <button
                    key={coin}
                    className="p-4 rounded-xl border border-zinc-700 hover:border-emerald-500/50 transition-all text-center"
                  >
                    <div className="text-lg font-bold text-white mb-1">{coin}</div>
                    <div className="text-xs text-zinc-500">{t('funding.zero_fee')}</div>
                  </button>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-white">{t('funding.networks')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {RAAS_CONFIG.cryptoGate.chains.map((chain) => (
                    <span key={chain} className="px-2 py-1 bg-zinc-900 rounded text-xs text-zinc-400 capitalize">
                      {chain}
                    </span>
                  ))}
                </div>
              </div>

              <Button3D full onClick={handleFundingComplete}>
                {t('actions.start_trading')} <Zap className="inline w-4 h-4 ml-1" />
              </Button3D>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
