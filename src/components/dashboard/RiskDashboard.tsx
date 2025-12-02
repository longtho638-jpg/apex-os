/**
 * Risk Dashboard - WOW Component
 * 
 * Beautiful real-time visualization of portfolio risk metrics with animated gauges and alerts.
 */

'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingDown, Target, AlertTriangle, Activity, Zap } from 'lucide-react';
import type { RiskMetrics } from '@/lib/risk/types';

interface RiskDashboardProps {
    metrics: RiskMetrics | null;
    portfolioValue: number;
    isDemo?: boolean;
}

export function RiskDashboard({ metrics, portfolioValue, isDemo = false }: RiskDashboardProps) {
    if (!metrics) {
        return (
            <div className="p-6 bg-gradient-to-br from-red-500/5 to-orange-500/5 rounded-xl border border-white/5">
                <div className="text-sm text-zinc-500 text-center">Calculating risk metrics...</div>
            </div>
        );
    }

    const {
        var95,
        cvar95,
        sharpeRatio,
        sortinoRatio,
        maxDrawdown,
        currentDrawdown,
        volatility
    } = metrics;

    // Risk levels
    const varLevel = var95 > 0.03 ? 'HIGH' : var95 > 0.02 ? 'MEDIUM' : 'LOW';
    const sharpeLevel = sharpeRatio < 0.5 ? 'LOW' : sharpeRatio < 1.5 ? 'MEDIUM' : 'HIGH';
    const ddLevel = maxDrawdown > 0.15 ? 'HIGH' : maxDrawdown > 0.10 ? 'MEDIUM' : 'LOW';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2 bg-gradient-to-br from-red-500/5 via-transparent to-orange-500/5 rounded-lg border border-white/10 backdrop-blur-sm relative overflow-hidden space-y-3"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl opacity-20 pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            Risk Management
                            {isDemo && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-bold border border-blue-500/30">
                                    DEMO DATA
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-zinc-500">Real-time monitoring</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${varLevel === 'LOW' ? 'bg-green-500/20 text-green-400' :
                    varLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    {varLevel} RISK
                </div>
            </div>

            {/* VaR Speedometer */}
            <div className="relative z-10">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Value at Risk (95%)
                    </span>
                    <span className={`font-bold font-mono ${varLevel === 'HIGH' ? 'text-red-400' :
                        varLevel === 'MEDIUM' ? 'text-yellow-400' :
                            'text-green-400'
                        }`}>
                        {(var95 * 100).toFixed(2)}%
                    </span>
                </div>

                {/* Gauge */}
                <div className="relative h-20 bg-black/30 rounded-xl overflow-hidden">
                    {/* Zones */}
                    <div className="absolute inset-0 flex">
                        <div className="w-1/3 bg-green-500/10" />
                        <div className="w-1/3 bg-yellow-500/10" />
                        <div className="w-1/3 bg-red-500/10" />
                    </div>

                    {/* Needle */}
                    <motion.div
                        className="absolute top-0 h-full w-1 bg-white shadow-lg"
                        initial={{ left: '0%' }}
                        animate={{ left: `${Math.min(var95 / 0.05, 1) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white rounded-full shadow-xl" />
                    </motion.div>

                    {/* Labels */}
                    <div className="absolute inset-x-0 top-full mt-1 flex justify-between text-[9px] text-zinc-600">
                        <span>0%</span>
                        <span className="text-yellow-500">2%</span>
                        <span className="text-red-500">5%+</span>
                    </div>
                </div>

                {/* VaR Amount */}
                <div className="mt-4 p-3 bg-black/20 rounded-lg">
                    <div className="text-[10px] text-zinc-500 mb-1">Potential Loss (1-day, 95% confidence)</div>
                    <div className="text-2xl font-bold text-red-400 font-mono">
                        ${(portfolioValue * var95).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {/* CVaR */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] text-zinc-500">CVaR (95%)</span>
                    </div>
                    <div className="text-lg font-bold text-orange-400 font-mono">
                        {(cvar95 * 100).toFixed(2)}%
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-1">
                        Expected tail loss
                    </div>
                </div>

                {/* Sharpe Ratio */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] text-zinc-500">Sharpe Ratio</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${sharpeLevel === 'HIGH' ? 'text-green-400' :
                        sharpeLevel === 'MEDIUM' ? 'text-yellow-400' :
                            'text-red-400'
                        }`}>
                        {sharpeRatio.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-1">
                        Risk-adjusted return
                    </div>
                </div>

                {/* Sortino Ratio */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] text-zinc-500">Sortino Ratio</span>
                    </div>
                    <div className="text-lg font-bold text-purple-400 font-mono">
                        {sortinoRatio.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-1">
                        Downside-adjusted
                    </div>
                </div>

                {/* Max Drawdown */}
                <div className="bg-black/20 rounded-lg p-3 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-3 h-3 text-red-400" />
                        <span className="text-[10px] text-zinc-500">Max Drawdown</span>
                    </div>
                    <div className={`text-lg font-bold font-mono ${ddLevel === 'HIGH' ? 'text-red-400' :
                        ddLevel === 'MEDIUM' ? 'text-yellow-400' :
                            'text-green-400'
                        }`}>
                        {(maxDrawdown * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-zinc-600 mt-1">
                        Peak-to-trough
                    </div>
                </div>
            </div>

            {/* Drawdown Bar */}
            <div className="relative z-10">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">Current Drawdown</span>
                    <span className="text-white font-mono font-bold">
                        {(currentDrawdown * 100).toFixed(2)}%
                    </span>
                </div>
                <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(currentDrawdown / 0.20, 1) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    />
                    {/* Warning line at 10% */}
                    <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: '50%' }} />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
                    <span>0%</span>
                    <span className="text-yellow-500">10%</span>
                    <span className="text-red-500">20%+</span>
                </div>
            </div>

            {/* Volatility */}
            <div className="relative z-10 bg-black/20 rounded-lg p-3 border border-white/5">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-[10px] text-zinc-500 mb-1">Portfolio Volatility (Annual)</div>
                        <div className="text-xl font-bold text-blue-400 font-mono">
                            {(volatility * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 mb-1">Risk Status</div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${volatility > 0.40 ? 'bg-red-500/20 text-red-400' :
                            volatility > 0.25 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                            }`}>
                            {volatility > 0.40 ? 'HIGH' : volatility > 0.25 ? 'MODERATE' : 'LOW'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2 relative z-10">
                {var95 > 0.03 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        HIGH VAR
                    </motion.div>
                )}
                {maxDrawdown > 0.15 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-orange-500/20 text-orange-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                        MAX DD ALERT
                    </motion.div>
                )}
                {sharpeRatio < 0.5 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        LOW SHARPE
                    </motion.div>
                )}
                {varLevel === 'LOW' && sharpeLevel === 'HIGH' && ddLevel === 'LOW' && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-green-500/20 text-green-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        OPTIMAL RISK
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
