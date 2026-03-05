'use client';

import { Brain, DollarSign, TrendingUp, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock AI suggestions
const aiSuggestions = [
  { id: 1, text: 'Increase Bybit rebate to 48% to capture high-volume scalpers.', impact: '+$1,200/day' },
  { id: 2, text: 'Lower Binance rebate for Tier 1 users (churn risk low).', impact: '+$450/day' },
];

export default function PricingEngine() {
  const t = useTranslations('AdminPricing');
  const [tiers, setTiers] = useState([
    { name: 'VIP 1', volume: '$0 - $100k', rebate: 30, projected: 4500 },
    { name: 'VIP 2', volume: '$100k - $1M', rebate: 40, projected: 8200 },
    { name: 'Whale', volume: '$1M+', rebate: 50, projected: 15000 },
  ]);

  // Base configuration for calculation
  const TIER_CONFIG = {
    'VIP 1': { baseVolume: 100000, baseFee: 0.001 }, // $100k vol, 0.1% fee
    'VIP 2': { baseVolume: 500000, baseFee: 0.0008 }, // $500k vol, 0.08% fee
    Whale: { baseVolume: 2000000, baseFee: 0.0005 }, // $2M vol, 0.05% fee
  };

  const calculateProjection = (tierName: string, rebatePercent: number) => {
    const config = TIER_CONFIG[tierName as keyof typeof TIER_CONFIG];
    if (!config) return 0;

    // Logic:
    // 1. Calculate Net Fee taken by platform: BaseFee * (1 - Rebate/100)
    // 2. Volume Elasticity: Higher rebate attracts more volume.
    //    Let's say for every 10% increase in rebate, volume increases by 5%.
    const elasticityFactor = 1 + (rebatePercent / 100) * 0.5;
    const adjustedVolume = config.baseVolume * elasticityFactor;

    const netFeeRate = config.baseFee * (1 - rebatePercent / 100);
    const projectedProfit = adjustedVolume * netFeeRate;

    return Math.round(projectedProfit);
  };

  const handleRebateChange = (index: number, newValue: number) => {
    const newTiers = [...tiers];
    newTiers[index].rebate = newValue;
    newTiers[index].projected = calculateProjection(newTiers[index].name, newValue);
    setTiers(newTiers);
  };

  // Helper to render text with bold markdown (**text**)
  const renderWithBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-gray-300">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-6">
      {/* AI Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiSuggestions.map((suggestion) => (
          <Card key={suggestion.id} className="bg-[#00FF94]/5 border border-[#00FF94]/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-[#00FF94]/10 rounded-lg">
                <Brain className="w-5 h-5 text-[#00FF94]" />
              </div>
              <div>
                <h4 className="text-[#00FF94] font-bold text-sm mb-1 flex items-center gap-2">
                  {t('ai_optimization')}
                  <span className="text-xs bg-[#00FF94] text-black px-1.5 py-0.5 rounded font-mono">{t('new')}</span>
                </h4>
                <p className="text-gray-300 text-sm mb-2">{t(`suggestions.${suggestion.id}`)}</p>
                <div className="flex items-center gap-2 text-xs font-mono text-[#00FF94]">
                  <TrendingUp className="w-3 h-3" />
                  {t('projected_impact')}: {suggestion.impact}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tier Configuration */}
      <Card className="bg-black border border-gray-800">
        <CardHeader className="border-b border-gray-800">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00FF94]" />
            {t('configuration_title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          {tiers.map((tier, index) => (
            <div key={tier.name} className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{tier.volume}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#00FF94]">{tier.rebate}%</div>
                  <p className="text-xs text-gray-500 font-mono">{t('rebate_share')}</p>
                </div>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={tier.rebate}
                  onChange={(e) => handleRebateChange(index, parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00FF94]"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded border border-gray-800">
                <span className="text-sm text-gray-400">{t('est_daily_profit')}</span>
                <span className="text-[#00FF94] font-mono font-bold">${tier.projected.toLocaleString('en-US')}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Operational Guide */}
      <Card className="bg-[#111111] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            {t('guide.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#00FF94]" />
                {t('guide.formula_title')}
              </h4>
              <p className="text-xs text-gray-400 bg-black/50 p-3 rounded border border-gray-800 font-mono">
                {t('guide.formula_desc')}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                {t('guide.elasticity_title')}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">{t('guide.elasticity_desc')}</p>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00FF94]" />
              {t('guide.workflow_title')}
            </h4>
            <div className="relative">
              {/* Connecting Line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-800" />

              <div className="space-y-6 relative z-10">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#00FF94]/10 border border-[#00FF94]/30 flex items-center justify-center shrink-0">
                    <span className="text-[#00FF94] text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-200">{t('guide.workflow_step_1')}</h5>
                    <p className="text-xs text-gray-500">{t('guide.workflow_step_1_desc')}</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <span className="text-blue-500 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-200">{t('guide.workflow_step_2')}</h5>
                    <p className="text-xs text-gray-500">{t('guide.workflow_step_2_desc')}</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <span className="text-purple-500 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-200">{t('guide.workflow_step_3')}</h5>
                    <p className="text-xs text-gray-500">{t('guide.workflow_step_3_desc')}</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center shrink-0">
                    <span className="text-yellow-500 text-xs font-bold">4</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-200">{t('guide.workflow_step_4')}</h5>
                    <p className="text-xs text-gray-500">{t('guide.workflow_step_4_desc')}</p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs font-bold">5</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-200">{t('guide.workflow_step_5')}</h5>
                    <p className="text-xs text-gray-500">{t('guide.workflow_step_5_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#00FF94]" />
              {t('guide.ai_role_title')}
            </h4>
            <p className="text-sm text-gray-400 mb-3">{t('guide.ai_role_desc')}</p>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-2">
                <span className="text-[#00FF94] mt-0.5">•</span>
                <span>{renderWithBold(t('guide.ai_point_1'))}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF94] mt-0.5">•</span>
                <span>{renderWithBold(t('guide.ai_point_2'))}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#00FF94] mt-0.5">•</span>
                <span>{renderWithBold(t('guide.ai_point_3'))}</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <h4 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              {t('guide.strategy_title')}
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">{t('guide.strategy_desc')}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" className="border-gray-700 text-gray-400 hover:text-white">
          {t('reset_default')}
        </Button>
        <Button className="bg-[#00FF94] text-black hover:bg-[#00FF94]/90 font-bold">
          <Zap className="w-4 h-4 mr-2" />
          {t('apply_changes')}
        </Button>
      </div>
    </div>
  );
}
