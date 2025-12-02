import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Signal } from './AlphaDashboard';
import { MarketTicker } from '@/hooks/useMarketData';
import { MiniSparkline } from './MiniSparkline';
import { ApexDNA } from './ApexDNA';

interface SignalCardProps {
    signal: Signal;
    ticker: MarketTicker | undefined;
    isSelected: boolean;
    onClick: () => void;
    whaleScore: number;
    techScore: number;
}

export const SignalCard = memo(({ signal, ticker, isSelected, onClick, whaleScore, techScore }: SignalCardProps) => {
    const isBuy = signal.type === 'BUY';
    const isSell = signal.type === 'SELL';
    const isWatching = signal.type === 'WATCHING';

    // Dynamic Border Gradient based on Signal Type & Hybrid Score
    const getBorderClass = () => {
        if (isBuy) return 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
        if (isSell) return 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
        return 'border-white/5 hover:border-purple-500/30';
    };

    const hybridScore = (whaleScore + techScore) / 2;
    const pulseIntensity = hybridScore > 70 ? 'animate-pulse-fast' : 'animate-pulse-slow';

    return (
        <motion.div
            layout
            className={`relative p-3 rounded-xl border backdrop-blur-md transition-all cursor-pointer group overflow-hidden ${getBorderClass()} ${isSelected ? 'bg-white/5' : 'bg-black/20'}`}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Holographic Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />

            {/* Header: Symbol & Type */}
            <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all">
                        {signal.symbol}
                    </span>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isBuy ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    isSell ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-zinc-800 text-zinc-400 border-white/5'
                    }`}>
                    {isWatching ? 'SCAN' : signal.type}
                </span>
            </div>

            {/* Confluence Meter (The Apex Prism) */}
            <div className="mb-3 relative z-10">
                <ApexDNA whaleScore={whaleScore} techScore={techScore} isScanning={isWatching} />
            </div>

            {/* Data Grid */}
            <div className="flex justify-between items-end relative z-10">
                <div>
                    <div className="text-xs font-mono text-white font-medium tracking-tight">
                        {signal.price > 0 ? `$${signal.price.toLocaleString()}` : '--'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-purple-400 font-mono">W: {whaleScore.toFixed(0)}</span>
                        <span className="text-[9px] text-cyan-400 font-mono">T: {techScore.toFixed(0)}</span>
                    </div>
                </div>

                {/* Sparkline */}
                <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
                    <MiniSparkline
                        data={ticker?.history || []}
                        color={isBuy ? '#10B981' : isSell ? '#EF4444' : '#71717a'}
                    />
                </div>
            </div>

            {/* Hover Tooltip (Futuristic Data Reveal) */}
            <div className="absolute inset-0 bg-black/90 flex flex-col justify-center items-center opacity-0 group-hover:opacity-0 pointer-events-none transition-opacity duration-200 backdrop-blur-sm">
                {/* Placeholder for detailed hover view if needed later */}
            </div>
        </motion.div>
    );
});
