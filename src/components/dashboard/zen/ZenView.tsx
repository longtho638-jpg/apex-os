import React from 'react';
import { TraderDNA, ElementProfile } from '@/lib/constants/zen-modes';
import { WireframeRadarChart } from './WireframeRadarChart';

interface ZenViewProps {
    traderDNA: TraderDNA;
    primaryElement: ElementProfile;
    isAlphaWindow: boolean;
}

export function ZenView({ traderDNA, primaryElement, isAlphaWindow }: ZenViewProps) {
    return (
        <>
            {/* Radar */}
            <div className="py-4">
                <WireframeRadarChart data={traderDNA.elementScores} />
            </div>

            {/* Element Info */}
            <div className="text-center space-y-2">
                <div className="text-[9px] font-mono text-gray-500">
                    PRIMARY_ELEMENT
                </div>
                <div
                    className="text-2xl font-bold font-mono tracking-wider"
                    style={{
                        color: primaryElement.color,
                        textShadow: `0 0 10px ${primaryElement.glowColor}`
                    }}
                >
                    {primaryElement.icon} {primaryElement.code}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="border border-cyan-500/30 bg-black/40 p-3">
                    <div className="text-[9px] font-mono text-gray-500 mb-1">
                        ALPHA_WINDOW
                    </div>
                    <div className="font-mono text-xs text-cyan-400">
                        {traderDNA.alphaWindow.start} → {traderDNA.alphaWindow.end}
                    </div>
                    {isAlphaWindow && (
                        <div className="text-[9px] text-green-400 mt-1">● ACTIVE</div>
                    )}
                </div>

                <div className="border border-magenta-500/30 bg-black/40 p-3">
                    <div className="text-[9px] font-mono text-gray-500 mb-1">
                        WIN_RATE
                    </div>
                    <div className="font-mono text-xl font-bold">
                        {traderDNA.winRate}%
                    </div>
                </div>
            </div>

            {/* Counter Element */}
            <div className="border border-yellow-500/30 bg-yellow-500/5 p-3">
                <div className="text-[9px] font-mono text-gray-400 mb-1">
                    NEMESIS_ELEMENT
                </div>
                <div className="font-mono text-xs text-yellow-400">
                    {primaryElement.counterElement}
                </div>
            </div>

            {/* Nemesis Pair */}
            <div className="border border-red-500/30 bg-red-500/5 p-3">
                <div className="text-[9px] font-mono text-gray-400 mb-1">
                    NEMESIS_PAIR
                </div>
                <div className="font-mono text-sm text-red-400">
                    {traderDNA.nemesis}
                </div>
            </div>
        </>
    );
}
