import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraderDNA, QuantMetrics } from '@/lib/constants/zen-modes';
import { ZenProgressBar } from './ZenProgressBar';

interface QuantViewProps {
    traderDNA: TraderDNA;
    quantMetrics: QuantMetrics;
}

export function QuantView({ traderDNA, quantMetrics }: QuantViewProps) {
    return (
        <>
            {/* Metrics */}
            <div className="space-y-4">
                <ZenProgressBar
                    label="DISCIPLINE"
                    value={quantMetrics.discipline}
                    color="#00F0FF"
                />
                <ZenProgressBar
                    label="RISK_APPETITE"
                    value={quantMetrics.riskAppetite}
                    color="#FF0080"
                />
                <ZenProgressBar
                    label="CONSISTENCY"
                    value={quantMetrics.consistency}
                    color="#00FF00"
                />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="border border-cyan-500/30 bg-black/40 p-3">
                    <div className="text-[9px] font-mono text-gray-500 mb-1">WIN_RATE</div>
                    <div className="font-mono text-xl font-bold flex items-center gap-1">
                        {traderDNA.winRate}%
                        {traderDNA.winRate >= 50 ? (
                            <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                            <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                    </div>
                </div>

                <div className="border border-magenta-500/30 bg-black/40 p-3">
                    <div className="text-[9px] font-mono text-gray-500 mb-1">ALPHA_WINDOW</div>
                    <div className="font-mono text-xs font-bold text-magenta-400">
                        {traderDNA.alphaWindow.start}-{traderDNA.alphaWindow.end}
                    </div>
                </div>
            </div>

            {/* Behavioral Analysis */}
            <div className={cn(
                "border p-3 font-mono text-xs",
                quantMetrics.behavioralBias === 'Optimal'
                    ? "border-green-500/50 bg-green-500/10"
                    : "border-yellow-500/50 bg-yellow-500/10"
            )}>
                <div className="text-[9px] text-gray-400 mb-1">
                    BEHAVIORAL_BIAS
                </div>
                <div className={quantMetrics.behavioralBias === 'Optimal' ? 'text-green-400' : 'text-yellow-400'}>
                    {quantMetrics.behavioralBias}
                </div>
            </div>

            {/* Nemesis */}
            <div className="border border-red-500/30 bg-red-500/5 p-3">
                <div className="text-[9px] font-mono text-gray-400 mb-1">
                    WORST_PERFORMER
                </div>
                <div className="font-mono text-sm text-red-400">
                    {traderDNA.nemesis}
                </div>
            </div>
        </>
    );
}
