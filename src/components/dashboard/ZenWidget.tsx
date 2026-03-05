'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Eye, EyeOff, Flower2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { ELEMENTS, MOCK_TRADER_DNA, type QuantMetrics, type TraderDNA, type ViewMode } from '@/lib/constants/zen-modes';
import { cn } from '@/lib/utils';
import { HiddenView } from './zen/HiddenView';
import { QuantView } from './zen/QuantView';
import { ZenView } from './zen/ZenView';

export default function ApexIdentityEngine() {
  const t = useTranslations('DashboardComponents.Zen');
  const [viewMode, setViewMode] = useState<ViewMode>('ZEN');
  const [zenMode, setZenMode] = useState(false);
  const [traderDNA] = useState<TraderDNA>(MOCK_TRADER_DNA);

  const primaryElement = ELEMENTS.find((e) => e.name === traderDNA.primaryElement)!;

  // Map DNA to Quant metrics
  const quantMetrics: QuantMetrics = {
    discipline: traderDNA.elementScores.METAL,
    riskAppetite: traderDNA.elementScores.FIRE,
    consistency:
      100 - (Math.max(...Object.values(traderDNA.elementScores)) - Math.min(...Object.values(traderDNA.elementScores))),
    behavioralBias:
      traderDNA.winRate < 50
        ? t('revenge_trading')
        : traderDNA.elementScores.FIRE > 70
          ? t('overtrading_risk')
          : t('optimal'),
  };

  const currentHour = new Date().getHours();
  const isAlphaWindow =
    currentHour >= parseInt(traderDNA.alphaWindow.start.split(':')[0], 10) &&
    currentHour <= parseInt(traderDNA.alphaWindow.end.split(':')[0], 10);

  return (
    <div className="relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
                        linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
                    `,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="relative border border-cyan-500/20 bg-black/90 backdrop-blur-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <motion.div animate={{ rotate: viewMode === 'QUANT' ? 360 : 0 }} transition={{ duration: 0.5 }}>
              {viewMode === 'QUANT' ? (
                <BarChart3 className="h-5 w-5 text-cyan-400" />
              ) : (
                <Flower2 className="h-5 w-5 text-magenta-400" />
              )}
            </motion.div>
            <div>
              <h3 className="font-mono font-bold text-sm tracking-wider">{t('title')}</h3>
              <div className="text-[9px] text-gray-500 font-mono">
                {viewMode === 'QUANT' ? t('behavioral_metrics') : t('digital_feng_shui')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'QUANT' ? 'ZEN' : 'QUANT')}
              className={cn(
                'px-3 py-1.5 font-mono text-xs font-bold transition-all border',
                viewMode === 'QUANT'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                  : 'bg-magenta-500/20 border-magenta-500 text-magenta-400',
              )}
            >
              {viewMode}
            </button>

            {/* Zen Mode Toggle */}
            <button
              onClick={() => setZenMode(!zenMode)}
              className="p-1.5 border border-white/20 hover:border-white/40 transition-all"
            >
              {zenMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!zenMode ? (
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {viewMode === 'QUANT' ? (
                <QuantView traderDNA={traderDNA} quantMetrics={quantMetrics} />
              ) : (
                <ZenView traderDNA={traderDNA} primaryElement={primaryElement} isAlphaWindow={isAlphaWindow} />
              )}
            </motion.div>
          ) : (
            <HiddenView />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
