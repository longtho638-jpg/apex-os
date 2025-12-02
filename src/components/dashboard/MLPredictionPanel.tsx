/**
 * ML Prediction Panel - WOW Component
 * 
 * Stunning visualization of ML model predictions with confidence meters,
 * probability bars, and feature importance charts.
 */

'use client';

import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Activity, Zap, Target } from 'lucide-react';
import type { MLPrediction, FeatureImportance } from '@/lib/ml/types';

interface MLPredictionPanelProps {
    prediction: MLPrediction | null;
    featureImportance?: FeatureImportance[];
    loading?: boolean;
}

export function MLPredictionPanel({ prediction, featureImportance, loading }: MLPredictionPanelProps) {
    if (loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-white/5">
                <div className="flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                    <div className="text-sm text-zinc-500">AI analyzing...</div>
                </div>
            </div>
        );
    }

    if (!prediction) {
        return (
            <div className="p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-xl border border-white/5">
                <div className="text-sm text-zinc-500 text-center">No prediction available</div>
            </div>
        );
    }

    const { buyProbability, sellProbability, holdProbability, predictedClass, confidence } = prediction;
    const topFeatures = featureImportance?.slice(0, 5) || [];

    // Determine colors
    const predictionColor =
        predictedClass === 'BUY' ? 'text-green-400' :
            predictedClass === 'SELL' ? 'text-red-400' :
                'text-yellow-400';

    const predictionBg =
        predictedClass === 'BUY' ? 'bg-green-500/20' :
            predictedClass === 'SELL' ? 'bg-red-500/20' :
                'bg-yellow-500/20';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-lg border border-white/10 backdrop-blur-sm relative overflow-hidden space-y-3"
        >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{
                    background: predictedClass === 'BUY' ? 'radial-gradient(circle, rgba(34,197,94,0.3), transparent)' :
                        predictedClass === 'SELL' ? 'radial-gradient(circle, rgba(239,68,68,0.3), transparent)' :
                            'radial-gradient(circle, rgba(234,179,8,0.3), transparent)'
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">ML Prediction</h3>
                        <p className="text-xs text-zinc-500">Neural network confidence</p>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${predictionBg} ${predictionColor}`}>
                    {predictedClass}
                </div>
            </div>

            {/* Confidence Gauge */}
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-zinc-400">Model Confidence</span>
                    <span className={`text-2xl font-bold font-mono ${predictionColor}`}>
                        {(confidence * 100).toFixed(0)}%
                    </span>
                </div>

                {/* Circular Progress */}
                <div className="relative w-40 h-40 mx-auto">
                    {/* Background circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-white/5"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            className={predictedClass === 'BUY' ? 'text-green-400' :
                                predictedClass === 'SELL' ? 'text-red-400' :
                                    'text-yellow-400'}
                            initial={{ strokeDashoffset: 440 }}
                            animate={{
                                strokeDashoffset: 440 - (440 * confidence),
                                strokeDasharray: 440
                            }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </svg>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        {predictedClass === 'BUY' && <TrendingUp className="w-12 h-12 text-green-400" />}
                        {predictedClass === 'SELL' && <TrendingDown className="w-12 h-12 text-red-400" />}
                        {predictedClass === 'HOLD' && <Activity className="w-12 h-12 text-yellow-400" />}
                    </div>
                </div>
            </div>

            {/* Prediction Probabilities */}
            <div className="relative z-10 space-y-2">
                <div className="text-xs text-zinc-400 mb-3">Probability Distribution</div>

                {/* BUY Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-green-400 font-medium">BUY</span>
                        <span className="text-white font-mono">{(buyProbability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${buyProbability * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* HOLD Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-yellow-400 font-medium">HOLD</span>
                        <span className="text-white font-mono">{(holdProbability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${holdProbability * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        />
                    </div>
                </div>

                {/* SELL Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-red-400 font-medium">SELL</span>
                        <span className="text-white font-mono">{(sellProbability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-black/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-red-500 to-rose-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${sellProbability * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>

            {/* Feature Importance */}
            {topFeatures.length > 0 && (
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Target className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-zinc-400">Top Influential Features</span>
                    </div>

                    <div className="space-y-2">
                        {topFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.featureName}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-2"
                            >
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-300">{feature.featureName}</span>
                                        <span className="text-purple-400 font-mono">
                                            {(feature.importance * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${feature.importance * 100}%` }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 relative z-10">
                <div className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[9px] font-bold rounded flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    AI POWERED
                </div>
                {confidence > 0.7 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-green-500/20 text-green-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        HIGH CONFIDENCE
                    </motion.div>
                )}
                {confidence < 0.5 && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded flex items-center gap-1"
                    >
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        LOW CONFIDENCE
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
