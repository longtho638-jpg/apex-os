'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Activity, BarChart2, Zap, Shield, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';

interface Props {
    symbol: string; 
    type: 'BUY' | 'SELL';
    price: number;
    insight: string;
    netVolumeDelta: number; 
    onClose: () => void;
}

export default function SignalInspector({ symbol, type, price, insight, netVolumeDelta, onClose }: Props) {
    const isBuy = type === 'BUY';
    const color = isBuy ? 'text-emerald-400' : 'text-red-400';
    
    // Leverage State
    const [leverage, setLeverage] = useState(20);
    const positionSize = 100000; // $100k default
    const requiredMargin = positionSize / leverage;

    // Mock Order Book Data
    const asks = Array.from({ length: 15 }).map((_, i) => ({ price: price + (i + 1) * 2, size: Math.random() * 5 + 0.1 }));
    const bids = Array.from({ length: 15 }).map((_, i) => ({ price: price - (i + 1) * 2, size: Math.random() * 5 + 0.1 }));

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl w-full max-w-[1400px] h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-zinc-900/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:inline">Signal Inspector</span>
                        </div>
                        <div className="h-4 w-px bg-white/10 mx-2" />
                        <h2 className="text-lg font-black text-white flex items-center gap-2">
                            {symbol} <span className="text-zinc-600 text-xs font-medium">USDT.P</span>
                        </h2>
                        <Badge variant={isBuy ? "default" : "destructive"} className="ml-2 text-xs">
                            {type}
                        </Badge>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                    </button>
                </div>

                {/* Content Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
                    
                    {/* CHART AREA (3 cols) */}
                    <div className="lg:col-span-3 bg-black relative border-b lg:border-b-0 lg:border-r border-white/10 min-h-[400px]">
                        <div className="absolute inset-0 w-full h-full">
                            <iframe
                                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=BINANCE%3A${symbol}USDT&interval=5&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=F1F3F6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=BINANCE%3A${symbol}USDT`}
                                className="w-full h-full border-0"
                                allow="fullscreen"
                            />
                        </div>
                        
                        <div className="absolute top-3 left-3 z-10 bg-black/80 backdrop-blur px-3 py-1 rounded border border-white/10 flex items-center gap-2 shadow-lg pointer-events-none">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Verified Source</span>
                        </div>
                    </div>

                    {/* DATA PANEL (1 col) */}
                    <div className="lg:col-span-1 bg-[#050505] flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                            
                            {/* AI Insight */}
                            <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-xl">
                                <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> AI Analysis
                                </h3>
                                <p className="text-xs text-purple-100/80 leading-relaxed font-medium">
                                    {insight}
                                </p>
                            </div>

                            {/* Whale Radar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Whale Flow
                                    </h3>
                                    <span className={`text-xs font-mono font-bold ${netVolumeDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {netVolumeDelta > 0 ? '+' : ''}{(netVolumeDelta / 1000).toFixed(1)}k
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                                    <div className="w-1/2 flex justify-end border-r border-zinc-700">
                                        {netVolumeDelta < 0 && (
                                            <div className="h-full bg-red-500 rounded-l-sm" style={{ width: `${Math.min(Math.abs(netVolumeDelta)/5000, 100)}%` }} />
                                        )}
                                    </div>
                                    <div className="w-1/2 flex justify-start">
                                        {netVolumeDelta > 0 && (
                                            <div className="h-full bg-emerald-500 rounded-r-sm" style={{ width: `${Math.min(Math.abs(netVolumeDelta)/5000, 100)}%` }} />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Order Book */}
                            <div className="flex-1 min-h-[200px]">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <BarChart2 className="w-3 h-3" /> Depth
                                </h3>
                                <div className="space-y-px text-[10px] font-mono bg-black border border-white/5 rounded-lg overflow-hidden p-1">
                                    {/* Asks */}
                                    {[...asks].reverse().map((ask, i) => (
                                        <div key={`ask-${i}`} className="flex justify-between relative h-4 items-center px-2">
                                            <div className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0" style={{ width: `${Math.min(ask.size * 15, 100)}%` }} />
                                            <span className="text-red-400 z-10">{ask.price.toFixed(2)}</span>
                                            <span className="text-zinc-600 z-10">{ask.size.toFixed(3)}</span>
                                        </div>
                                    ))}
                                    
                                    <div className={`py-1 text-center font-bold ${color} bg-white/5 my-1 rounded`}>
                                        {price.toFixed(2)}
                                    </div>

                                    {/* Bids */}
                                    {bids.map((bid, i) => (
                                        <div key={`bid-${i}`} className="flex justify-between relative h-4 items-center px-2">
                                            <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0" style={{ width: `${Math.min(bid.size * 15, 100)}%` }} />
                                            <span className="text-emerald-400 z-10">{bid.price.toFixed(2)}</span>
                                            <span className="text-zinc-600 z-10">{bid.size.toFixed(3)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Execution Panel (Derivatives Ready) */}
                        <div className="p-5 bg-zinc-900/50 border-t border-white/10 shrink-0">
                            
                            {/* Leverage Slider */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-zinc-400 font-bold uppercase tracking-wider">Leverage</span>
                                    <span className="text-yellow-400 font-mono font-bold">{leverage}x</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="125" 
                                    step="1"
                                    value={leverage}
                                    onChange={(e) => setLeverage(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                />
                                <div className="flex justify-between text-[10px] text-zinc-600 mt-1 font-mono">
                                    <span>1x</span>
                                    <span>50x</span>
                                    <span>125x</span>
                                </div>
                            </div>

                            <div className="flex justify-between text-xs mb-3 bg-white/5 p-2 rounded-lg border border-white/5">
                                <div>
                                    <span className="block text-zinc-500 text-[10px] uppercase">Pos Size</span>
                                    <span className="text-white font-mono">${positionSize.toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-zinc-500 text-[10px] uppercase">Required Margin</span>
                                    <span className="text-[#00FF94] font-mono font-bold">${requiredMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>

                                                        <Button3D
                                                            full
                                                            variant={isBuy ? 'primary' : 'danger'}
                                                            className="shadow-xl py-3"
                                                        >                                <div className="flex flex-col items-center leading-tight">
                                    <span className="text-sm font-black flex items-center gap-2">
                                        <Crosshair className="w-4 h-4" /> {isBuy ? 'LONG' : 'SHORT'} {symbol}
                                    </span>
                                    <span className="text-[10px] opacity-80 font-normal">Market Order • {leverage}x Leverage</span>
                                </div>
                            </Button3D>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}