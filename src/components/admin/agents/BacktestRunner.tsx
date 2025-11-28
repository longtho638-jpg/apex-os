'use client';

import React, { useState } from 'react';
import { PlayCircle, Calendar, BarChart2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BacktestRunner() {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<any>(null);

    const runBacktest = () => {
        setIsRunning(true);
        // Mock simulation delay
        setTimeout(() => {
            setResults({
                total_return: 145.2,
                win_rate: 68.5,
                max_drawdown: 12.4,
                trades: 142,
                sharpe: 2.1
            });
            setIsRunning(false);
        }, 2000);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-full">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-400" />
                Backtest Engine
            </h2>

            <div className="space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">Start Date</label>
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded px-3 py-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input type="date" className="bg-transparent text-sm text-white outline-none w-full" defaultValue="2024-01-01" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-gray-500">End Date</label>
                        <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded px-3 py-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input type="date" className="bg-transparent text-sm text-white outline-none w-full" defaultValue="2024-12-31" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={runBacktest}
                    disabled={isRunning}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                    {isRunning ? (
                        <span className="animate-pulse">Simulating Market...</span>
                    ) : (
                        <>
                            <PlayCircle className="h-5 w-5" />
                            Run Simulation
                        </>
                    )}
                </button>
            </div>

            {results && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <div className="text-xs text-green-400 mb-1">Total Return</div>
                            <div className="text-2xl font-bold text-white">+{results.total_return}%</div>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <div className="text-xs text-blue-400 mb-1">Win Rate</div>
                            <div className="text-2xl font-bold text-white">{results.win_rate}%</div>
                        </div>
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="text-xs text-red-400 mb-1">Max Drawdown</div>
                            <div className="text-2xl font-bold text-white">-{results.max_drawdown}%</div>
                        </div>
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                            <div className="text-xs text-purple-400 mb-1">Sharpe Ratio</div>
                            <div className="text-2xl font-bold text-white">{results.sharpe}</div>
                        </div>
                    </div>

                    <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                            <TrendingUp className="h-3 w-3" />
                            <span>Equity Curve Preview</span>
                        </div>
                        <div className="h-32 flex items-end gap-1">
                            {[40, 45, 42, 50, 55, 52, 60, 65, 62, 70, 75, 80, 78, 85, 90, 88, 95, 100].map((h, i) => (
                                <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-gradient-to-t from-purple-500/20 to-blue-500/50 rounded-t-sm hover:bg-blue-500 transition-colors" />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
