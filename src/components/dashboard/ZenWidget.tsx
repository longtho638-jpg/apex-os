"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Flower2, Eye, EyeOff, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ==================== TYPE DEFINITIONS ====================
type Element = 'FIRE' | 'WATER' | 'EARTH' | 'METAL' | 'WOOD';
type ViewMode = 'QUANT' | 'ZEN';

interface TraderDNA {
    primaryElement: Element;
    elementScores: Record<Element, number>;
    alphaWindow: { start: string; end: string };
    nemesis: string;
    winRate: number;
}

interface QuantMetrics {
    discipline: number;      // 0-100
    riskAppetite: number;   // 0-100
    consistency: number;    // 0-100
    behavioralBias: string;
}

interface ElementProfile {
    name: Element;
    code: string;
    icon: string;
    color: string;
    glowColor: string;
    counterElement: string;
}

// ==================== CONSTANTS ====================
const ELEMENTS: ElementProfile[] = [
    {
        name: 'FIRE',
        code: 'HF_SCPL',
        icon: '⚡',
        color: '#FF0080',
        glowColor: 'rgba(255, 0, 128, 0.5)',
        counterElement: 'WATER (Market Dump)'
    },
    {
        name: 'WATER',
        code: 'SWG_TRD',
        icon: '〰️',
        color: '#00F0FF',
        glowColor: 'rgba(0, 240, 255, 0.5)',
        counterElement: 'EARTH (Sideways)'
    },
    {
        name: 'EARTH',
        code: 'POS_HLD',
        icon: '◼',
        color: '#FFD700',
        glowColor: 'rgba(255, 215, 0, 0.5)',
        counterElement: 'WOOD (FOMO Pumps)'
    },
    {
        name: 'METAL',
        code: 'ALG_BOT',
        icon: '⬡',
        color: '#C0C0C0',
        glowColor: 'rgba(192, 192, 192, 0.5)',
        counterElement: 'FIRE (Volatility)'
    },
    {
        name: 'WOOD',
        code: 'GRW_INV',
        icon: '▲',
        color: '#00FF00',
        glowColor: 'rgba(0, 255, 0, 0.5)',
        counterElement: 'METAL (Regulation)'
    }
];

// Mock data
const MOCK_TRADER_DNA: TraderDNA = {
    primaryElement: 'FIRE',
    elementScores: {
        FIRE: 85,
        WATER: 45,
        EARTH: 30,
        METAL: 60,
        WOOD: 25
    },
    alphaWindow: { start: '09:30', end: '11:00' },
    nemesis: 'SOL/USDT',
    winRate: 62
};

// ==================== WIREFRAME RADAR CHART ====================
function WireframeRadarChart({ data }: { data: Record<Element, number> }) {
    const size = 200;
    const center = size / 2;
    const maxRadius = size / 2 - 30;
    const angleStep = (Math.PI * 2) / 5;

    const dataPoints = ELEMENTS.map((elem, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const value = data[elem.name];
        const radius = (value / 100) * maxRadius;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    const gridLevels = [25, 50, 75, 100];

    return (
        <svg width={size} height={size} className="mx-auto">
            <defs>
                <filter id="neon-glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Grid */}
            {gridLevels.map((level) => {
                const gridPoints = ELEMENTS.map((_, i) => {
                    const angle = angleStep * i - Math.PI / 2;
                    const radius = (level / 100) * maxRadius;
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ');

                return (
                    <polygon
                        key={level}
                        points={gridPoints}
                        fill="none"
                        stroke="rgba(0,255,255,0.15)"
                        strokeWidth="0.5"
                    />
                );
            })}

            {/* Axis */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const x = center + maxRadius * Math.cos(angle);
                const y = center + maxRadius * Math.sin(angle);
                return (
                    <line
                        key={elem.name}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="rgba(0,255,255,0.2)"
                        strokeWidth="0.5"
                    />
                );
            })}

            {/* Data */}
            <polygon
                points={dataPoints}
                fill="rgba(255, 0, 128, 0.1)"
                stroke="#FF0080"
                strokeWidth="1.5"
                filter="url(#neon-glow)"
            />

            {/* Points */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const value = data[elem.name];
                const radius = (value / 100) * maxRadius;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);

                return (
                    <circle
                        key={elem.name}
                        cx={x}
                        cy={y}
                        r="2"
                        fill={elem.color}
                        filter="url(#neon-glow)"
                    />
                );
            })}

            {/* Labels */}
            {ELEMENTS.map((elem, i) => {
                const angle = angleStep * i - Math.PI / 2;
                const labelRadius = maxRadius + 18;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                return (
                    <text
                        key={elem.name}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[9px] font-mono"
                        fill={elem.color}
                    >
                        {elem.icon}
                    </text>
                );
            })}
        </svg>
    );
}

// ==================== PROGRESS BAR ====================
function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{value}%</span>
            </div>
            <div className="h-1.5 bg-black/50 border border-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full"
                    style={{
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        boxShadow: `0 0 10px ${color}66`
                    }}
                />
            </div>
        </div>
    );
}

// ==================== MAIN COMPONENT ====================
export default function ApexIdentityEngine() {
    const [viewMode, setViewMode] = useState<ViewMode>('ZEN');
    const [zenMode, setZenMode] = useState(false);
    const [traderDNA] = useState<TraderDNA>(MOCK_TRADER_DNA);

    const primaryElement = ELEMENTS.find(e => e.name === traderDNA.primaryElement)!;

    // Map DNA to Quant metrics
    const quantMetrics: QuantMetrics = {
        discipline: traderDNA.elementScores.METAL,
        riskAppetite: traderDNA.elementScores.FIRE,
        consistency: 100 - (Math.max(...Object.values(traderDNA.elementScores)) - Math.min(...Object.values(traderDNA.elementScores))),
        behavioralBias: traderDNA.winRate < 50 ? 'Revenge Trading Detected' :
            traderDNA.elementScores.FIRE > 70 ? 'Overtrading Risk' :
                'Optimal'
    };

    const currentHour = new Date().getHours();
    const isAlphaWindow = currentHour >= parseInt(traderDNA.alphaWindow.start.split(':')[0]) &&
        currentHour <= parseInt(traderDNA.alphaWindow.end.split(':')[0]);

    return (
        <div className="relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }} />
            </div>

            <div className="relative border border-cyan-500/20 bg-black/90 backdrop-blur-sm p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: viewMode === 'QUANT' ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {viewMode === 'QUANT' ? (
                                <BarChart3 className="h-5 w-5 text-cyan-400" />
                            ) : (
                                <Flower2 className="h-5 w-5 text-magenta-400" />
                            )}
                        </motion.div>
                        <div>
                            <h3 className="font-mono font-bold text-sm tracking-wider">
                                APEX_IDENTITY_ENGINE
                            </h3>
                            <div className="text-[9px] text-gray-500 font-mono">
                                {viewMode === 'QUANT' ? 'BEHAVIORAL_METRICS' : 'DIGITAL_FENG_SHUI'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'QUANT' ? 'ZEN' : 'QUANT')}
                            className={cn(
                                "px-3 py-1.5 font-mono text-xs font-bold transition-all border",
                                viewMode === 'QUANT'
                                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                    : "bg-magenta-500/20 border-magenta-500 text-magenta-400"
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
                                /* QUANT MODE */
                                <>
                                    {/* Metrics */}
                                    <div className="space-y-4">
                                        <ProgressBar
                                            label="DISCIPLINE"
                                            value={quantMetrics.discipline}
                                            color="#00F0FF"
                                        />
                                        <ProgressBar
                                            label="RISK_APPETITE"
                                            value={quantMetrics.riskAppetite}
                                            color="#FF0080"
                                        />
                                        <ProgressBar
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
                            ) : (
                                /* ZEN MODE */
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
                            )}
                        </motion.div>
                    ) : (
                        /* ZEN HIDDEN MODE */
                        <motion.div
                            key="zen-hidden"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="py-12 text-center space-y-6"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="w-24 h-24 mx-auto border-2 border-cyan-500/30 rounded-full flex items-center justify-center"
                            >
                                <div className="w-16 h-16 border-2 border-magenta-500/30 rounded-full" />
                            </motion.div>

                            <div className="space-y-2 text-xs font-mono text-gray-500">
                                <p>// PROFIT_DISPLAY: HIDDEN</p>
                                <p>// EMOTIONAL_OVERRIDE: ACTIVE</p>
                                <p>// FOCUS: STRATEGY_ONLY</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
