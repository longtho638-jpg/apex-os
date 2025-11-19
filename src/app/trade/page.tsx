"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowUp, ArrowDown, Search, Brain, Zap, ShieldCheck, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/os/sidebar';

// --- Types ---
type TickerData = {
    s: string; // Symbol
    c: string; // Current Price
    P: string; // Price Change Percent
};

type PriceMap = Record<string, { price: number; change: number; prevPrice: number }>;

// --- Constants ---
const SYMBOLS = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt', 'xrpusdt', 'dogeusdt', 'adausdt'];
const STREAM_URL = `wss://stream.binance.com:9443/stream?streams=${SYMBOLS.map(s => `${s}@ticker`).join('/')}`;

export default function CommandCenter() {
    const [prices, setPrices] = useState<PriceMap>({});
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
    const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
    const wsRef = useRef<WebSocket | null>(null);

    // --- WebSocket Logic ---
    useEffect(() => {
        const connect = () => {
            setConnectionStatus('connecting');
            const ws = new WebSocket(STREAM_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnectionStatus('connected');
                console.log('Binance WS Connected');
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                const data: TickerData = message.data;
                const symbol = data.s.toUpperCase(); // BTCUSDT
                const currentPrice = parseFloat(data.c);
                const changePercent = parseFloat(data.P);

                setPrices(prev => {
                    const prevData = prev[symbol];
                    // Optimization: Only update if price actually changed
                    if (prevData && prevData.price === currentPrice) return prev;

                    return {
                        ...prev,
                        [symbol]: {
                            price: currentPrice,
                            change: changePercent,
                            prevPrice: prevData ? prevData.price : currentPrice
                        }
                    };
                });
            };

            ws.onclose = () => {
                setConnectionStatus('disconnected');
                // Auto-reconnect after 3s
                setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error('WS Error:', err);
                ws.close();
            };
        };

        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // --- Derived Data for Insights ---
    const insights = useMemo(() => {
        const btc = prices['BTCUSDT'];
        if (!btc) return { funding: 'Stable', volatility: 'Low', sentiment: 'Neutral' };

        const isVolatile = Math.abs(btc.change) > 1.5;
        const isBullish = btc.change > 0.5;
        const isBearish = btc.change < -0.5;

        return {
            funding: isBullish ? 'Rising' : isBearish ? 'Falling' : 'Stable',
            volatility: isVolatile ? 'High' : 'Normal',
            sentiment: isBullish ? 'Bullish' : isBearish ? 'Bearish' : 'Neutral',
            fundingColor: isBullish ? 'text-yellow-400' : 'text-blue-400',
            volatilityColor: isVolatile ? 'text-red-500' : 'text-green-500',
        };
    }, [prices['BTCUSDT']]); // Only re-calc when BTC changes

    return (
        <div className="flex h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-hidden selection:bg-[#00FF00]/20">
            <Sidebar />
            {/* COLUMN 1: Market Watch & Chart */}
            <div className="w-[350px] flex flex-col border-r border-white/10">
                {/* Market Watch */}
                <div className="h-1/2 flex flex-col border-b border-white/10">
                    <div className="h-10 flex items-center justify-between px-4 border-b border-white/10 bg-[#0A0A0A]">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Market Watch</span>
                        <div className="flex items-center gap-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full", connectionStatus === 'connected' ? "bg-[#00FF00]" : "bg-red-500")} />
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {SYMBOLS.map(s => {
                            const symbol = s.toUpperCase();
                            const data = prices[symbol];
                            return (
                                <MarketRow
                                    key={symbol}
                                    symbol={symbol.replace('USDT', '/USDT')}
                                    rawSymbol={symbol}
                                    price={data?.price || 0}
                                    prevPrice={data?.prevPrice || 0}
                                    change={data?.change || 0}
                                    isSelected={selectedSymbol === symbol}
                                    onClick={() => setSelectedSymbol(symbol)}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Chart Placeholder (Static for now, could be dynamic later) */}
                <div className="h-1/2 flex flex-col bg-[#0A0A0A]">
                    <div className="h-10 flex items-center px-4 border-b border-white/10 justify-between">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">BTC/USDT</span>
                            <span className="text-xs text-[#00FF00] bg-[#00FF00]/10 px-1.5 py-0.5 rounded">PERP</span>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500">
                            <span className="text-white cursor-pointer">15m</span>
                        </div>
                    </div>
                    <div className="flex-1 relative p-4">
                        {/* Simple SVG Chart */}
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00FF00" stopOpacity="0.2" />
                                    <stop offset="100%" stopColor="#00FF00" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,100 Q20,80 40,90 T80,60 T120,70 T160,40 T200,50 T240,20 T280,30 T320,10"
                                fill="url(#chartGradient)"
                                stroke="#00FF00"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                            />
                        </svg>
                        <div className="absolute top-4 left-4">
                            <div className="text-2xl font-bold text-[#00FF00]">
                                {prices['BTCUSDT']?.price.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '---'}
                            </div>
                            <div className="text-xs text-gray-400">Real-time Data</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMN 2: Order Book & Trades (Mocked for layout, but could be real) */}
            <div className="w-[300px] flex flex-col border-r border-white/10">
                <MockOrderBook
                    currentPrice={prices[selectedSymbol]?.price || 98000}
                    symbol={selectedSymbol}
                />
            </div>

            {/* COLUMN 3: AGENTIC INSIGHTS */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 flex flex-col bg-[#0A0A0A]">
                    <div className="h-10 flex items-center px-6 border-b border-white/10 justify-between bg-gradient-to-r from-[#0A0A0A] to-blue-900/10">
                        <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-400" />
                            <span className="font-bold tracking-wider text-blue-400">AGENTIC INSIGHTS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3 text-blue-400 animate-pulse" />
                            <span className="text-[10px] text-blue-400 font-mono">LIVE</span>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto">
                        {/* Fee Forecast */}
                        <InsightCard
                            title="Fee Forecast"
                            icon={<Zap className="h-5 w-5 text-yellow-400" />}
                            borderColor="border-yellow-500/30"
                            bgColor="bg-yellow-500/5"
                        >
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm text-gray-300">Funding Rate</span>
                                <span className={cn("text-xl font-bold", insights.fundingColor)}>{insights.funding}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: insights.funding === 'Rising' ? '80%' : '40%' }}></div>
                            </div>
                            <p className="text-xs text-gray-400">
                                {insights.funding === 'Rising'
                                    ? "Projected increase. Consider closing shorts."
                                    : "Rate stabilizing. Long positions favorable."}
                            </p>
                        </InsightCard>

                        {/* Volatility Scanner */}
                        <InsightCard
                            title="Volatility Scanner"
                            icon={<TrendingUp className="h-5 w-5 text-red-400" />}
                            borderColor="border-red-500/30"
                            bgColor="bg-red-500/5"
                        >
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm text-gray-300">Market State</span>
                                <span className={cn("text-xl font-bold", insights.volatilityColor)}>{insights.volatility}</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                                <div className={cn("h-2 rounded-full", insights.volatility === 'High' ? "bg-red-500 w-[90%]" : "bg-green-500 w-[30%]")}></div>
                            </div>
                            <p className="text-xs text-gray-400">
                                {insights.volatility === 'High'
                                    ? "High slippage risk detected. Use Limit Orders."
                                    : "Market conditions stable. Execution risk low."}
                            </p>
                        </InsightCard>

                        {/* Trade Setup Rating */}
                        <InsightCard
                            title="Trade Setup Rating"
                            icon={<ShieldCheck className="h-5 w-5 text-blue-400" />}
                            borderColor="border-blue-500/30"
                            bgColor="bg-blue-500/5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-3xl font-bold text-white uppercase">{insights.sentiment}</span>
                                <div className="text-right">
                                    <div className="text-xs text-gray-400">Confidence</div>
                                    <div className="text-blue-400 font-bold">85%</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">
                                AI Model analyzing real-time order flow and price action.
                            </p>
                        </InsightCard>
                    </div>
                </div>

                {/* Bottom Section: PORTFOLIO HEALTH CHECK */}
                <div className="h-[300px] border-t border-white/10 bg-[#0A0A0A] flex flex-col">
                    <div className="h-10 flex items-center px-4 border-b border-white/10 gap-6 bg-gradient-to-r from-[#0A0A0A] to-green-900/10">
                        <span className="text-sm font-bold border-b-2 border-[#00FF00] h-full flex items-center px-2 text-[#00FF00]">PORTFOLIO HEALTH CHECK</span>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-gray-500 bg-white/5 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 font-medium">Symbol</th>
                                    <th className="px-4 py-2 font-medium">Size</th>
                                    <th className="px-4 py-2 font-medium">Entry</th>
                                    <th className="px-4 py-2 font-medium">Mark Price</th>
                                    <th className="px-4 py-2 font-medium">PnL (ROE%)</th>
                                    <th className="px-4 py-2 font-medium text-blue-400">AI Optimization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <HealthRow
                                    symbol="BTC/USDT"
                                    size={0.5}
                                    entry={96200}
                                    currentPrice={prices['BTCUSDT']?.price || 96200}
                                    side="long"
                                />
                                <HealthRow
                                    symbol="ETH/USDT"
                                    size={10}
                                    entry={3500}
                                    currentPrice={prices['ETHUSDT']?.price || 3500}
                                    side="short"
                                />
                                <HealthRow
                                    symbol="SOL/USDT"
                                    size={100}
                                    entry={130}
                                    currentPrice={prices['SOLUSDT']?.price || 130}
                                    side="long"
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Sub-Components ---

function MarketRow({ symbol, rawSymbol, price, prevPrice, change, isSelected, onClick }: {
    symbol: string,
    rawSymbol: string,
    price: number,
    prevPrice: number,
    change: number,
    isSelected: boolean,
    onClick: () => void
}) {
    const isUp = price > prevPrice;
    const isDown = price < prevPrice;
    const colorClass = change >= 0 ? "text-[#00FF00]" : "text-red-500";
    const priceColor = isUp ? "text-[#00FF00]" : isDown ? "text-red-500" : "text-white";

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-b border-white/5",
                isSelected
                    ? "bg-[#00FF00]/10 border-l-2 border-l-[#00FF00]"
                    : "hover:bg-white/5"
            )}
        >
            <div className="flex flex-col">
                <span className="font-bold text-sm">{symbol}</span>
                <span className="text-[10px] text-gray-500">Perpetual</span>
            </div>
            <div className="flex flex-col items-end">
                <span className={cn("text-sm font-mono transition-colors duration-300", priceColor)}>
                    {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className={cn("text-xs font-medium", colorClass)}>
                    {change > 0 ? '+' : ''}{change.toFixed(2)}%
                </span>
            </div>
        </div>
    );
}

function HealthRow({ symbol, size, entry, currentPrice, side }: { symbol: string, size: number, entry: number, currentPrice: number, side: 'long' | 'short' }) {
    const pnl = side === 'long' ? (currentPrice - entry) * size : (entry - currentPrice) * size;
    const roe = (pnl / (entry * size / 20)) * 100; // Assuming 20x leverage for ROE calc
    const isPositive = pnl >= 0;

    return (
        <tr className="hover:bg-white/5 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-8 rounded-full", side === 'long' ? "bg-[#00FF00]" : "bg-red-500")} />
                    <div>
                        <div className="font-bold">{symbol}</div>
                        <div className={cn("text-[10px] uppercase", side === 'long' ? "text-[#00FF00]" : "text-red-500")}>{side}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 font-mono text-gray-300">{size}</td>
            <td className="px-4 py-3 font-mono text-gray-300">{entry.toLocaleString()}</td>
            <td className="px-4 py-3 font-mono text-gray-300">{currentPrice.toLocaleString()}</td>
            <td className="px-4 py-3">
                <div className={cn("font-mono font-bold", isPositive ? "text-[#00FF00]" : "text-red-500")}>
                    {pnl > 0 ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </div>
                <div className={cn("text-[10px]", isPositive ? "text-[#00FF00]" : "text-red-500")}>
                    {roe.toFixed(2)}%
                </div>
            </td>
            <td className="px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-blue-400">
                {isPositive ? "HOLD (Trend Strong)" : "MONITOR (Risk Elevated)"}
            </td>
        </tr>
    );
}

function InsightCard({ title, icon, children, borderColor, bgColor }: any) {
    return (
        <div className={cn("rounded-xl border p-5 transition-all hover:scale-[1.02]", borderColor, bgColor)}>
            <div className="flex items-center gap-2 mb-4">
                {icon}
                <h3 className="font-bold text-sm tracking-wide uppercase">{title}</h3>
            </div>
            {children}
        </div>
    );
}

// Mock Component for Order Book to save space, but updated with real price prop
function MockOrderBook({ currentPrice, symbol }: { currentPrice: number; symbol: string }) {
    const [orderBook, setOrderBook] = React.useState<{
        asks: Array<{ price: number; size: string }>;
        bids: Array<{ price: number; size: string }>;
    }>({ asks: [], bids: [] });

    // Generate mock order book on client-side only to avoid hydration mismatch
    React.useEffect(() => {
        const asks = Array.from({ length: 10 }).map((_, i) => ({
            price: currentPrice + (i + 1) * 5,
            size: Math.random().toFixed(3)
        })).reverse();

        const bids = Array.from({ length: 10 }).map((_, i) => ({
            price: currentPrice - (i + 1) * 5,
            size: Math.random().toFixed(3)
        }));

        setOrderBook({ asks, bids });
    }, [currentPrice, symbol]);

    return (
        <div className="flex flex-col h-full">
            <div className="h-10 flex items-center px-4 border-b border-white/10 bg-[#0A0A0A]">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Book</span>
                <span className="ml-auto text-xs font-mono text-[#00FF00]">{symbol.replace('USDT', '/USDT')}</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col text-xs font-mono">
                <div className="flex-1 flex flex-col-reverse justify-end overflow-hidden pb-1">
                    {orderBook.asks.map((ask, i) => (
                        <div key={i} className="flex px-2 py-0.5 hover:bg-white/5 cursor-pointer relative">
                            <span className="w-1/3 text-red-500">{ask.price.toFixed(1)}</span>
                            <span className="w-1/3 text-right text-gray-400">{ask.size}</span>
                        </div>
                    ))}
                </div>
                <div className="py-2 border-y border-white/10 flex items-center justify-center gap-2 bg-white/5">
                    <span className="text-lg font-bold text-[#00FF00]">{currentPrice.toLocaleString()}</span>
                </div>
                <div className="flex-1 overflow-hidden pt-1">
                    {orderBook.bids.map((bid, i) => (
                        <div key={i} className="flex px-2 py-0.5 hover:bg-white/5 cursor-pointer relative">
                            <span className="w-1/3 text-[#00FF00]">{bid.price.toFixed(1)}</span>
                            <span className="w-1/3 text-right text-gray-400">{bid.size}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
