"use client";

import React from 'react';
import { Sidebar } from '@/components/os/sidebar';
import { Shield, AlertTriangle, RefreshCw, TrendingDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRiskMetrics } from '@/hooks/useRiskMetrics';
import { cn } from '@/lib/utils';

export default function RiskPage() {
    const t = useTranslations('Risk');
    const { liquidationData, leverageData, fundingData, loading, error, refetch } = useRiskMetrics();

    // Calculate risk level color
    const getRiskColor = (score: number) => {
        if (score < 30) return 'text-[#00FF94]';
        if (score < 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getRiskBgColor = (score: number) => {
        if (score < 30) return 'bg-[#00FF94]';
        if (score < 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getLeverageColor = (level: string) => {
        if (level === 'low') return 'text-[#00FF94]';
        if (level === 'medium') return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="flex h-screen w-full bg-[#030303] text-white font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-20%] right-[10%] w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px]" />
                </div>

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 z-10 border-b border-white/5 bg-[#030303]/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <Shield className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">Báo Về Rủi Ro</h1>
                            <p className="text-xs text-gray-400">Risk Management</p>
                        </div>
                    </div>

                    <button
                        onClick={refetch}
                        disabled={loading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto z-10">
                    {/* Error State */}
                    {error && (
                        <div className="glass-card rounded-xl p-6 border-red-500/20 bg-red-500/5">
                            <p className="text-red-400 mb-2 font-medium">Error loading risk data</p>
                            <p className="text-sm text-gray-400">{error.message}</p>
                            <button
                                onClick={refetch}
                                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !liquidationData && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                                        <div className="h-4 bg-white/10 rounded w-24 mb-4" />
                                        <div className="h-8 bg-white/10 rounded w-32" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data Display */}
                    {liquidationData && leverageData && !loading && (
                        <div className="space-y-6">
                            {/* Risk Score Gauge */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Overall Risk Score</h2>
                                <div className="flex items-center gap-8">
                                    {/* Circular Gauge */}
                                    <div className="relative w-40 h-40">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="rgba(255,255,255,0.1)"
                                                strokeWidth="12"
                                                fill="none"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                className={getRiskBgColor(liquidationData.risk_score)}
                                                strokeWidth="12"
                                                fill="none"
                                                strokeDasharray={`${(liquidationData.risk_score / 100) * 440} 440`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className={cn("text-3xl font-bold", getRiskColor(liquidationData.risk_score))}>
                                                {liquidationData.risk_score}
                                            </div>
                                            <div className="text-xs text-gray-400">/ 100</div>
                                        </div>
                                    </div>

                                    {/* Risk Breakdown */}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-400">Liquidation Distance</span>
                                                <span className={getRiskColor(liquidationData.distance_percent)}>
                                                    {liquidationData.distance_percent.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={getRiskBgColor(100 - liquidationData.distance_percent)}
                                                    style={{ width: `${liquidationData.distance_percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm font-medium text-yellow-500">Liquidation Price</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                ${liquidationData.liquidation_price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Leverage Analysis */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Leverage Analysis</h2>
                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <span className="text-sm text-gray-400 block mb-2">Current Leverage</span>
                                        <div className="text-3xl font-bold text-white">
                                            {leverageData.current_leverage}x
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-400 block mb-2">Recommended</span>
                                        <div className="text-3xl font-bold text-[#00FF94]">
                                            {leverageData.recommended_leverage}x
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-400 block mb-2">Risk Level</span>
                                        <div className={cn("text-3xl font-bold uppercase", getLeverageColor(leverageData.risk_level))}>
                                            {leverageData.risk_level}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Positions Exposure */}
                            <div className="glass-card rounded-xl p-6">
                                <h2 className="text-lg font-bold mb-4">Position Exposure</h2>

                                {liquidationData.positions.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                    <th className="pb-3">Symbol</th>
                                                    <th className="pb-3 text-right">Size</th>
                                                    <th className="pb-3 text-right">Leverage</th>
                                                    <th className="pb-3 text-right">Liq. Price</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {liquidationData.positions.map((pos, idx) => (
                                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="py-3 font-mono font-bold">{pos.symbol}</td>
                                                        <td className="py-3 text-right text-gray-300">
                                                            {pos.size.toFixed(4)}
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            <span className={cn(
                                                                "font-bold",
                                                                pos.leverage > 10 ? "text-red-500" : "text-[#00FF94]"
                                                            )}>
                                                                {pos.leverage}x
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right text-gray-300">
                                                            ${pos.liquidation_price.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-gray-400">
                                        <Shield className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                        <p>No open positions</p>
                                    </div>
                                )}
                            </div>

                            {/* Funding Rates */}
                            {fundingData && (
                                <div className="glass-card rounded-xl p-6">
                                    <h2 className="text-lg font-bold mb-4">Funding Rates Monitor</h2>

                                    {fundingData.rates.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                                                        <th className="pb-3">Symbol</th>
                                                        <th className="pb-3 text-right">Rate</th>
                                                        <th className="pb-3">Next Funding</th>
                                                        <th className="pb-3 text-right">Est. Payment</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {fundingData.rates.map((rate, idx) => (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                                                            <td className="py-3 font-mono font-bold">{rate.symbol}</td>
                                                            <td className={cn(
                                                                "py-3 text-right font-bold",
                                                                rate.rate > 0 ? "text-red-500" : "text-[#00FF94]"
                                                            )}>
                                                                {(rate.rate * 100).toFixed(4)}%
                                                            </td>
                                                            <td className="py-3 text-gray-300">
                                                                {new Date(rate.next_funding).toLocaleString()}
                                                            </td>
                                                            <td className={cn(
                                                                "py-3 text-right font-bold",
                                                                rate.estimated_payment > 0 ? "text-red-500" : "text-[#00FF94]"
                                                            )}>
                                                                ${Math.abs(rate.estimated_payment).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-400">
                                            <TrendingDown className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                            <p>No funding data available</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
