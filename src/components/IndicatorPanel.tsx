"use client";

import React, { useState } from 'react';
import { Settings, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IndicatorSettings {
    // Moving Averages
    sma: { enabled: boolean; period: number; color: string };
    ema: { enabled: boolean; period: number; color: string };

    // Momentum
    rsi: { enabled: boolean; period: number; overbought: number; oversold: number };
    macd: { enabled: boolean; fast: number; slow: number; signal: number };

    // Volatility
    bb: { enabled: boolean; period: number; stdDev: number };
    atr: { enabled: boolean; period: number };

    // Volume
    volume: { enabled: boolean };
}

const DEFAULT_INDICATORS: IndicatorSettings = {
    sma: { enabled: false, period: 20, color: '#FF6B6B' },
    ema: { enabled: false, period: 12, color: '#4ECDC4' },
    rsi: { enabled: false, period: 14, overbought: 70, oversold: 30 },
    macd: { enabled: false, fast: 12, slow: 26, signal: 9 },
    bb: { enabled: false, period: 20, stdDev: 2 },
    atr: { enabled: false, period: 14 },
    volume: { enabled: false },
};

interface IndicatorPanelProps {
    settings: IndicatorSettings;
    onUpdate: (settings: IndicatorSettings) => void;
}

export default function IndicatorPanel({ settings, onUpdate }: IndicatorPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    const updateIndicator = (key: keyof IndicatorSettings, updates: any) => {
        onUpdate({
            ...settings,
            [key]: { ...settings[key], ...updates }
        });
    };

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
                <Settings className="h-4 w-4" />
                <span className="text-xs font-medium">Indicators</span>
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 max-h-[600px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-y-auto z-[100]">
                    {/* Moving Averages */}
                    <div className="border-b border-white/5">
                        <div className="p-3 bg-white/5">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <TrendingUp className="h-4 w-4 text-blue-400" />
                                Moving Averages
                            </div>
                        </div>

                        {/* SMA */}
                        <div className="p-3 border-b border-white/5">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">SMA (Simple)</span>
                                <input
                                    type="checkbox"
                                    checked={settings.sma.enabled}
                                    onChange={(e) => updateIndicator('sma', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.sma.enabled && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Period:</label>
                                        <input
                                            type="number"
                                            value={settings.sma.period}
                                            onChange={(e) => updateIndicator('sma', { period: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Color:</label>
                                        <input
                                            type="color"
                                            value={settings.sma.color}
                                            onChange={(e) => updateIndicator('sma', { color: e.target.value })}
                                            className="flex-1 h-8 bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* EMA */}
                        <div className="p-3">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">EMA (Exponential)</span>
                                <input
                                    type="checkbox"
                                    checked={settings.ema.enabled}
                                    onChange={(e) => updateIndicator('ema', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.ema.enabled && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Period:</label>
                                        <input
                                            type="number"
                                            value={settings.ema.period}
                                            onChange={(e) => updateIndicator('ema', { period: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Color:</label>
                                        <input
                                            type="color"
                                            value={settings.ema.color}
                                            onChange={(e) => updateIndicator('ema', { color: e.target.value })}
                                            className="flex-1 h-8 bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Momentum Indicators */}
                    <div className="border-b border-white/5">
                        <div className="p-3 bg-white/5">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Activity className="h-4 w-4 text-purple-400" />
                                Momentum
                            </div>
                        </div>

                        {/* RSI */}
                        <div className="p-3 border-b border-white/5">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">RSI</span>
                                <input
                                    type="checkbox"
                                    checked={settings.rsi.enabled}
                                    onChange={(e) => updateIndicator('rsi', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.rsi.enabled && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-20">Period:</label>
                                        <input
                                            type="number"
                                            value={settings.rsi.period}
                                            onChange={(e) => updateIndicator('rsi', { period: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-20">Overbought:</label>
                                        <input
                                            type="number"
                                            value={settings.rsi.overbought}
                                            onChange={(e) => updateIndicator('rsi', { overbought: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-20">Oversold:</label>
                                        <input
                                            type="number"
                                            value={settings.rsi.oversold}
                                            onChange={(e) => updateIndicator('rsi', { oversold: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MACD */}
                        <div className="p-3">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">MACD</span>
                                <input
                                    type="checkbox"
                                    checked={settings.macd.enabled}
                                    onChange={(e) => updateIndicator('macd', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.macd.enabled && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Fast:</label>
                                        <input
                                            type="number"
                                            value={settings.macd.fast}
                                            onChange={(e) => updateIndicator('macd', { fast: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Slow:</label>
                                        <input
                                            type="number"
                                            value={settings.macd.slow}
                                            onChange={(e) => updateIndicator('macd', { slow: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Signal:</label>
                                        <input
                                            type="number"
                                            value={settings.macd.signal}
                                            onChange={(e) => updateIndicator('macd', { signal: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Volatility */}
                    <div className="border-b border-white/5">
                        <div className="p-3 bg-white/5">
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Activity className="h-4 w-4 text-yellow-400" />
                                Volatility
                            </div>
                        </div>

                        {/* Bollinger Bands */}
                        <div className="p-3 border-b border-white/5">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Bollinger Bands</span>
                                <input
                                    type="checkbox"
                                    checked={settings.bb.enabled}
                                    onChange={(e) => updateIndicator('bb', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.bb.enabled && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Period:</label>
                                        <input
                                            type="number"
                                            value={settings.bb.period}
                                            onChange={(e) => updateIndicator('bb', { period: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-[10px] text-gray-500 w-16">Std Dev:</label>
                                        <input
                                            type="number"
                                            value={settings.bb.stdDev}
                                            onChange={(e) => updateIndicator('bb', { stdDev: parseInt(e.target.value) })}
                                            className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ATR */}
                        <div className="p-3">
                            <label className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">ATR</span>
                                <input
                                    type="checkbox"
                                    checked={settings.atr.enabled}
                                    onChange={(e) => updateIndicator('atr', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                            {settings.atr.enabled && (
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] text-gray-500 w-16">Period:</label>
                                    <input
                                        type="number"
                                        value={settings.atr.period}
                                        onChange={(e) => updateIndicator('atr', { period: parseInt(e.target.value) })}
                                        className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Volume */}
                    <div>
                        <div className="p-3">
                            <label className="flex items-center justify-between">
                                <span className="text-xs font-medium">Volume</span>
                                <input
                                    type="checkbox"
                                    checked={settings.volume.enabled}
                                    onChange={(e) => updateIndicator('volume', { enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { DEFAULT_INDICATORS };
