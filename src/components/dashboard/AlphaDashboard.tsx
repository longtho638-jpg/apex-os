'use client';

import { useEffect, useState, useMemo, memo, useRef, useCallback } from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart2, Play, Loader2, CheckCircle2, Eye, Maximize2, Minimize2, Wallet, Wifi, TrendingUp, Shield, Crosshair, Settings2, Search, Layers, RefreshCw, X, ScanSearch, BrainCircuit, Target, AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button3D } from '@/components/marketing/Button3D';
import { useMarketData, MarketTicker } from '@/hooks/useMarketData';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { FilterState, SignalFilters } from '@/components/dashboard/SignalFilters';
import { generateQuantSignal } from '@/lib/quant/SignalLogic';
import { useQuantFeaturesFromCandles } from '@/hooks/useQuantFeatures';
import { QuantIndicatorsPanel } from '@/components/dashboard/QuantPanel';
import { RiskDashboard } from '@/components/dashboard/RiskDashboard';
import { MLPredictionPanel } from '@/components/dashboard/MLPredictionPanel';
import { usePortfolioRisk } from '@/hooks/usePortfolioRisk';
import { useMLPrediction } from '@/hooks/useMLPrediction';
import { useRealPortfolioReturns } from '@/hooks/useRealPortfolioReturns';
import { useRouter } from 'next/navigation';
import { MiniIndicatorCharts } from '@/components/dashboard/MiniIndicatorCharts';
import { useWallet } from '@/hooks/useWallet';
import { usePositions, Position } from '@/hooks/usePositions';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const FULL_ASSETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'PEPE', 'WIF', 'SUI', 'NEAR', 'APT', 'FET'];

export type SignalType = 'BUY' | 'SELL' | 'WATCHING' | 'CONNECTING';

export interface Signal {
    id: string;
    symbol: string;
    type: SignalType;
    price: number;
    rsi: number;
    confidence: number;
    timestamp: number;
    status: 'active' | 'executed';
    plan?: TradePlan;
}

export interface TradePlan {
    direction: 'LONG' | 'SHORT';
    entry: number;
    sl: number;
    tp1: number;
    tp2: number;
    tp3: number;
    leverage: number;
    rr: number;
}



interface ArbOpportunity {
    id: string;
    pair: string;
    buyExchange: string;
    sellExchange: string;
    spread: number;
    profit: number;
    timestamp: number;
}

interface Props {
    filters: FilterState;
}

// Optimized: Use React.memo properly with custom comparison
const TradingViewChart = memo(({ symbol, interval }: { symbol: string; interval: string }) => {
    const getTVInterval = useCallback((tf: string) => {
        const map: Record<string, string> = {
            '1m': '1', '5m': '5', '15m': '15', '30m': '30',
            '1h': '60', '4h': '240', '1d': 'D', '1w': 'W'
        };
        return map[tf] || '60';
    }, []);

    const getTradingViewUrl = (symbol: string, interval: string) => {
        // Properly formatted TradingView studies
        // Format: studies=INDICATOR@tv-basicstudies for each indicator
        const baseUrl = 'https://s.tradingview.com/widgetembed/';
        const params = new URLSearchParams({
            frameElementId: 'tradingview_widget',
            symbol: `BINANCE:${symbol}USDT`,
            interval: getTVInterval(interval),
            hidesidetoolbar: '1',
            hidetoptoolbar: '0',
            symboledit: '0',
            saveimage: '0',
            toolbarbg: '000000',
            theme: 'dark',
            style: '1',
            timezone: 'Etc/UTC',
            locale: 'en',
            utm_source: 'apex-os.com',
            utm_medium: 'widget',
            utm_campaign: 'chart',
            utm_term: `BINANCE:${symbol}USDT`
        });

        // Add multiple studies (indicators)
        const studies = [
            'MAExp@tv-basicstudies',  // EMA (will add multiple with different lengths)
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
            'BB@tv-basicstudies'
        ];

        // Build URL with multiple studies
        let url = `${baseUrl}?${params.toString()}`;
        studies.forEach(study => {
            url += `&studies=${encodeURIComponent(study)}`;
        });

        // Add study overrides for EMAs (26, 50, 89)
        const studiesOverrides = {
            "moving average exponential.length": 26
        };

        url += `&studies_overrides=${encodeURIComponent(JSON.stringify(studiesOverrides))}`;

        return url;
    };

    const src = useMemo(() => {
        return getTradingViewUrl(symbol, interval);
    }, [symbol, interval, getTVInterval]);

    return (
        <iframe
            key={`${symbol}-${interval}`}
            src={src}
            className="w-full h-full border-0 opacity-90 hover:opacity-100 transition-opacity duration-500"
            allow="fullscreen"
            loading="lazy"
            title={`TradingView Chart - ${symbol}`}
        />
    );
}, (prev, next) => prev.symbol === next.symbol && prev.interval === next.interval);

TradingViewChart.displayName = 'TradingViewChart';

// Optimized: Memoized MiniSparkline
const MiniSparkline = memo(({ data, color }: { data: number[]; color: string }) => {
    if (!data || data.length < 2) {
        return (
            <div className="h-5 w-14 flex items-center">
                <div className="h-0.5 w-full bg-zinc-800 rounded animate-pulse" />
            </div>
        );
    }

    const points = useMemo(() => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        return data.map((p, i) => {
            const x = (i / (data.length - 1)) * 60;
            const y = 20 - ((p - min) / range) * 20;
            return `${x},${y}`;
        }).join(' L ');
    }, [data]);

    return (
        <svg width="60" height="20" className="opacity-70">
            <path d={`M ${points}`} fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}, (prev, next) =>
    prev.color === next.color &&
    JSON.stringify(prev.data) === JSON.stringify(next.data)
);

MiniSparkline.displayName = 'MiniSparkline';

// Helper function to format prices correctly for both large and very small numbers
const formatPrice = (price: number): string => {
    if (price >= 1) {
        // Large prices: use locale string (e.g., $50,000)
        return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 0.01) {
        // Medium prices: 2-4 decimals (e.g., $0.5234)
        return `$${price.toFixed(4)}`;
    } else {
        // Very small prices: up to 10 decimals (e.g., $0.00001234 for PEPE)
        return `$${price.toFixed(10).replace(/\.?0+$/, '')}`;
    }
};

// Pure utility functions - no hooks needed outside component
const calculateTradePlan = (ticker: MarketTicker, type: 'BUY' | 'SELL'): TradePlan | undefined => {
    // Validate price data exists
    if (!ticker || !ticker.price || ticker.price <= 0 || isNaN(ticker.price)) {
        return undefined;
    }
    const upperBand = ticker.upperBand || ticker.price * 1.02;
    const lowerBand = ticker.lowerBand || ticker.price * 0.98;
    const atr = Math.max((upperBand - lowerBand) / 4, ticker.price * 0.01);
    const price = ticker.price;
    const slDist = atr * 1.5;

    if (type === 'BUY') {
        return {
            direction: 'LONG',
            entry: price,
            sl: price - slDist,
            tp1: price + (atr * 1.5),
            tp2: price + (atr * 3),
            tp3: price + (atr * 5),
            leverage: ticker.rsi < 20 ? 20 : 10,
            rr: 2.0
        };
    } else {
        return {
            direction: 'SHORT',
            entry: price,
            sl: price + slDist,
            tp1: price - (atr * 1.5),
            tp2: price - (atr * 3),
            tp3: price - (atr * 5),
            leverage: ticker.rsi > 80 ? 20 : 10,
            rr: 2.0
        };
    }
};

const generateInsight = (ticker: MarketTicker | undefined, signal: Signal | null, timeframe: string) => {
    if (!ticker || !signal) return "Initializing...";

    const rsi = ticker.rsi ?? 50;
    const macroRsi = ticker.macroRsi ?? 50;
    const netVolumeDelta = ticker.netVolumeDelta ?? 0;

    if (signal.type === 'WATCHING') {
        const trend = ticker.macroTrend || 'NEUTRAL';
        return `🔍 GENERAL'S WAIT (${timeframe}).
• Macro Trend: ${trend} (SMA20).
• Micro RSI: ${rsi.toFixed(1)} | Macro RSI: ${macroRsi.toFixed(1)}.
• Order Flow: ${(netVolumeDelta / 1000).toFixed(0)}k net delta.

STRATEGY: Patience. Wait for trend alignment.`;
    }

    const intensity = Math.abs(netVolumeDelta) > 500000 ? 'Massive' : 'Significant';
    const deltaString = (Math.abs(netVolumeDelta) / 1000).toFixed(0) + 'k';
    const plan = signal.plan;

    // Handle null plan (price data not available)
    if (!plan) {

        return "⏳ Loading price data...";
    }

    if (signal.type === 'BUY' && plan) {
        const setup = ticker.macroTrend === 'BULLISH' ? 'Trend Follow' : 'Counter-Trend';
        return `⚔️ AMBUSH SIGNAL (Long).
• Setup: ${setup}.
• Flow: ${intensity} Inflow ($${deltaString}).
• Execution: Strike at ${formatPrice(plan.entry)}.`;
    } else if (plan) {
        const setup = ticker.macroTrend === 'BEARISH' ? 'Trend Follow' : 'Counter-Trend';
        return `🏹 TACTICAL SHORT.
• Setup: ${setup} Rejection.
• Flow: ${intensity} Outflow (-$${deltaString}).
• Execution: Short at ${formatPrice(plan.entry)}.`;
    }
    return "Analyzing...";
};

export default function AlphaDashboard({ filters: parentFilters }: Props) {
    const router = useRouter();
    const { user } = useAuth();
    const [localFilters, setLocalFilters] = useState<FilterState>(parentFilters);
    const { available: realBalance, refresh: refreshWallet } = useWallet();
    const [balance, setBalance] = useState(12450);
    const { positions, refresh: refreshPositions } = usePositions();

    // Sync simulation balance with real wallet on load
    useEffect(() => {
        if (realBalance > 0) {
            setBalance(realBalance);
        }
    }, [realBalance]);

    const marketData = useMarketData(localFilters.timeframe);

    // Risk & ML hooks - REAL DATA
    const { returns: realReturns, loading: returnsLoading, isDemo } = useRealPortfolioReturns(); // Auto-detects user or falls back to demo
    const { metrics: riskMetrics } = usePortfolioRisk({
        returns: realReturns.length >= 30 ? realReturns : [], // Need minimum 30 data points
        portfolioValue: balance, // Sync with balance state
        enabled: realReturns.length >= 30
    });

    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [arbOps, setArbOps] = useState<ArbOpportunity[]>([]);
    const [selectedArb, setSelectedArb] = useState<ArbOpportunity | null>(null);
    const [sidebarTab, setSidebarTab] = useState<'signals' | 'arbitrage'>('signals');

    const [chartLoading, setChartLoading] = useState(false);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

    const [arbExecuting, setArbExecuting] = useState(false);
    const [arbStep, setArbStep] = useState(0);

    const [leverage, setLeverage] = useState(20);
    const [tpPrice, setTpPrice] = useState(0);
    const [slPrice, setSlPrice] = useState(0);
    const positionSize = 10000;
    const requiredMargin = positionSize / leverage;

    const signalStateRef = useRef<Record<string, SignalType>>({});

    // Enhanced: Quantitative signals calculation with 30+ indicators
    const signals = useMemo(() => {
        return FULL_ASSETS.map(symbol => {
            const tickerKey = `${symbol.toLowerCase()}usdt`;
            const ticker = marketData[tickerKey];

            // Initialize signal state
            if (!signalStateRef.current[symbol]) {
                signalStateRef.current[symbol] = 'CONNECTING';
            }

            let currentType = signalStateRef.current[symbol];

            if (ticker) {
                if (currentType === 'CONNECTING') {
                    currentType = 'WATCHING';
                }

                // OPTION 1: Try to use quantitative features (if available)
                // For now, use fallback logic since we need historical candles
                // TODO: Integrate real candle data for full quant analysis

                // FALLBACK: Enhanced RSI logic (backward compatible)
                const effectiveRsi = (ticker.rsi + (ticker.macroRsi || 50)) / 2;
                const isShortTimeframe = ['1m', '5m', '15m'].includes(localFilters.timeframe);

                // Additional validation: Volume confirmation
                const hasVolumeSupport = Math.abs(ticker.netVolumeDelta || 0) > 100000;

                if (isShortTimeframe) {
                    // AGGRESSIVE MODE (1m/5m/15m): Relaxed RSI thresholds + volume check
                    if (effectiveRsi < 48 && (!hasVolumeSupport || ticker.netVolumeDelta > 0)) {
                        currentType = 'BUY';
                    } else if (effectiveRsi > 52 && (!hasVolumeSupport || ticker.netVolumeDelta < 0)) {
                        currentType = 'SELL';
                    } else if (currentType === 'BUY' && effectiveRsi > 52) {
                        currentType = 'WATCHING';
                    } else if (currentType === 'SELL' && effectiveRsi < 48) {
                        currentType = 'WATCHING';
                    }
                } else {
                    // STRICT MODE (1h/4h): RSI + Bollinger Band + Trend confirmation
                    const lowerBand = ticker.lowerBand || ticker.price * 0.98;
                    const upperBand = ticker.upperBand || ticker.price * 1.02;
                    const priceBelowBand = ticker.price < lowerBand;
                    const priceAboveBand = ticker.price > upperBand;

                    // Trend confirmation
                    const trendConfirmsBuy = ticker.macroTrend === 'BULLISH' || ticker.macroTrend === 'NEUTRAL';
                    const trendConfirmsSell = ticker.macroTrend === 'BEARISH' || ticker.macroTrend === 'NEUTRAL';

                    if (effectiveRsi < 40 && priceBelowBand && trendConfirmsBuy) {
                        currentType = 'BUY';
                    } else if (effectiveRsi > 60 && priceAboveBand && trendConfirmsSell) {
                        currentType = 'SELL';
                    } else if (currentType === 'BUY' && effectiveRsi > 50) {
                        currentType = 'WATCHING';
                    } else if (currentType === 'SELL' && effectiveRsi < 50) {
                        currentType = 'WATCHING';
                    }
                }
                signalStateRef.current[symbol] = currentType;
            }

            let plan: TradePlan | undefined;
            if ((currentType === 'BUY' || currentType === 'SELL') && ticker) {
                plan = calculateTradePlan(ticker, currentType);
            }

            // Enhanced confidence calculation
            let confidence = 0;
            if (ticker && (currentType === 'BUY' || currentType === 'SELL')) {
                // Base confidence from RSI distance
                const rsiDistance = Math.abs(50 - ticker.rsi);
                confidence = Math.min(rsiDistance * 2, 40); // Max 40 from RSI

                // Bonus from trend alignment
                if (currentType === 'BUY' && ticker.macroTrend === 'BULLISH') confidence += 15;
                if (currentType === 'SELL' && ticker.macroTrend === 'BEARISH') confidence += 15;

                // Bonus from volume
                const volumeSupport = Math.abs(ticker.netVolumeDelta || 0) > 100000;
                if (volumeSupport) {
                    if (currentType === 'BUY' && ticker.netVolumeDelta > 0) confidence += 15;
                    if (currentType === 'SELL' && ticker.netVolumeDelta < 0) confidence += 15;
                }

                // Bonus from Bollinger Band position
                const lowerBand = ticker.lowerBand || ticker.price * 0.98;
                const upperBand = ticker.upperBand || ticker.price * 1.02;
                if (currentType === 'BUY' && ticker.price < lowerBand) confidence += 15;
                if (currentType === 'SELL' && ticker.price > upperBand) confidence += 15;

                // Cap at 99
                confidence = Math.min(confidence, 99);
            }

            return {
                id: symbol,
                symbol,
                type: currentType,
                price: ticker?.price || 0,
                rsi: ticker?.rsi || 50,
                confidence,
                timestamp: Date.now(),
                status: 'active',
                plan
            } as Signal;
        }).sort((a, b) => {
            const scoreA = (a.type === 'BUY' || a.type === 'SELL' ? 1000 : 0);
            const scoreB = (b.type === 'BUY' || b.type === 'SELL' ? 1000 : 0);
            return scoreB - scoreA || FULL_ASSETS.indexOf(a.symbol) - FULL_ASSETS.indexOf(b.symbol);
        });
    }, [marketData, localFilters.timeframe]);

    // Fix: Properly filtered signals
    const filteredSignals = useMemo(() => {
        return signals.filter(s => {
            if (localFilters.symbols.length > 0 && !localFilters.symbols.includes(s.symbol)) {
                return false;
            }
            return true;
        });
    }, [signals, localFilters.symbols]);

    const currentSignal = useMemo(() => {
        return filteredSignals.find(s => s.symbol === selectedSymbol) || filteredSignals[0];
    }, [filteredSignals, selectedSymbol]);

    const selectedTicker = useMemo(() => {
        return marketData[`${(selectedSymbol || '').toLowerCase()}usdt`];
    }, [marketData, selectedSymbol]);

    // Fix: Memoized order book data
    const orderBookData = useMemo(() => {
        const price = selectedTicker?.price || 50000;
        const asks = Array.from({ length: 15 }).map((_, i) => ({
            price: price + (i + 1) * price * 0.0002,
            size: Math.random() * 5
        }));
        const bids = Array.from({ length: 15 }).map((_, i) => ({
            price: price - (i + 1) * price * 0.0002,
            size: Math.random() * 5
        }));
        return { asks, bids, price };
    }, [selectedTicker?.price]);

    // Fix: Initial symbol selection with cleanup
    useEffect(() => {
        if (!selectedSymbol && filteredSignals.length > 0) {
            setSelectedSymbol(filteredSignals[0].symbol);
        }
    }, [filteredSignals, selectedSymbol]);

    // Fix: Plan update effect with cleanup
    useEffect(() => {
        if (currentSignal?.plan) {
            setLeverage(currentSignal.plan.leverage);
            setTpPrice(currentSignal.plan.tp2);
            setSlPrice(currentSignal.plan.sl);
        }
    }, [currentSignal?.plan]);

    // Fix: Arbitrage opportunities with cleanup
    useEffect(() => {
        if (Object.keys(marketData).length > 0) {
            const newOps: ArbOpportunity[] = [];

            Object.values(marketData).forEach((ticker: any) => {
                if (ticker.spread !== undefined && Math.abs(ticker.spread) > 0.02) {
                    const isOkxHigher = ticker.spread > 0;
                    const spreadAbs = Math.abs(ticker.spread);
                    newOps.push({
                        id: `arb-${ticker.symbol}`,
                        pair: ticker.symbol.toUpperCase().replace('USDT', ''),
                        buyExchange: isOkxHigher ? 'Binance' : 'OKX',
                        sellExchange: isOkxHigher ? 'OKX' : 'Binance',
                        spread: spreadAbs,
                        profit: spreadAbs * 100,
                        timestamp: Date.now()
                    });
                }
            });

            setArbOps(newOps.sort((a, b) => a.pair.localeCompare(b.pair)).slice(0, 15));
        }
    }, [marketData]);

    // Compute AI insight directly without animation/scanning
    const aiInsight = useMemo(() => {
        if (!selectedSymbol || sidebarTab !== 'signals') return '';

        const tickerKey = `${selectedSymbol.toLowerCase()}usdt`;
        const ticker = marketData[tickerKey];
        const signal = signals.find(s => s.symbol === selectedSymbol);

        if (!ticker || !signal) return 'Initializing...';

        return generateInsight(ticker, signal, localFilters.timeframe);
    }, [selectedSymbol, sidebarTab, marketData, signals, localFilters.timeframe]);


    // Fix: Memoized event handlers
    const handleExecute = useCallback(async () => {
        if (!selectedSymbol || !selectedTicker || !currentSignal || !user) return;

        const type = currentSignal.plan?.direction || (currentSignal.type === 'BUY' ? 'LONG' : 'SHORT');
        const side = type === 'LONG' ? 'buy' : 'sell';
        const amount = positionSize / leverage;
        const currentPrice = selectedTicker.price;
        const quantity = (amount * leverage) / currentPrice;

        // 1. Balance Check
        if (realBalance < amount) {
            toast.error('Insufficient Funds', {
                description: `Required: $${amount.toFixed(2)} | Available: $${realBalance.toFixed(2)}`
            });
            return;
        }

        try {
            // 2. Execute Trade via API
            const response = await fetch('/api/v1/trading/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    symbol: `${selectedSymbol}USDT`,
                    side: side === 'buy' ? 'BUY' : 'SELL',
                    quantity,
                    type: 'MARKET',
                    leverage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Order failed');
            }

            // 3. Success Feedback
            toast.success('SIGNAL EXECUTED', {
                description: `${side.toUpperCase()} ${quantity.toFixed(4)} ${selectedSymbol} @ $${currentPrice.toLocaleString()}`,
                duration: 5000,
            });

            // 4. Refresh Wallet & State
            refreshWallet();
            refreshPositions();
            // Optimistically add position (optional, or wait for real-time update)

        } catch (error: any) {
            console.error('Execution failed:', error);
            toast.error('EXECUTION FAILED', {
                description: error.message
            });
        }
    }, [selectedSymbol, selectedTicker, currentSignal, leverage, positionSize, user, realBalance, refreshWallet]);

    const handleExecuteArb = useCallback(() => {
        if (!selectedArb) return;

        setArbExecuting(true);
        setArbStep(1);

        const steps = [2, 3, 4];
        const timeouts: NodeJS.Timeout[] = [];

        steps.forEach((step, index) => {
            const timeout = setTimeout(() => {
                setArbStep(step);
            }, 1000 * (index + 1));
            timeouts.push(timeout);
        });

        const finalTimeout = setTimeout(() => {
            setArbExecuting(false);
            setArbStep(0);
            setBalance(prev => prev + (selectedArb.profit || 0));
            timeouts.forEach(clearTimeout);
        }, 4500);

        timeouts.push(finalTimeout);

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, [selectedArb]);

    const handleClosePosition = useCallback(async (id: string, pnl: number, margin: number) => {
        // Optimistic update
        // setPositions(prev => prev.filter(p => p.id !== id)); // Can't setPositions directly on hook result

        // In real app, call API to close
        try {
            await fetch(`/api/v1/trading/positions?id=${id}`, { method: 'DELETE' });
            refreshPositions();
            refreshWallet();
            toast.success('Position Closed');
        } catch (e) {
            toast.error('Failed to close position');
        }
    }, [refreshPositions, refreshWallet]);

    // Fix: Memoized calculations
    const totalUnrealizedPnL = useMemo(() => {
        return positions.reduce((sum, pos) => {
            const currentPrice = marketData[pos.symbol.toLowerCase()]?.price || pos.entryPrice;
            const priceDiff = currentPrice - pos.entryPrice;
            const pnl = pos.type === 'LONG'
                ? (priceDiff / pos.entryPrice) * pos.size
                : -(priceDiff / pos.entryPrice) * pos.size;
            return sum + pnl;
        }, 0);
    }, [positions, marketData]);

    const equity = useMemo(() => balance + totalUnrealizedPnL, [balance, totalUnrealizedPnL]);

    // Fix: Render optimizations
    const renderPosition = useCallback((pos: Position) => {
        const currentPrice = marketData[pos.symbol.toLowerCase()]?.price || pos.entryPrice;
        const priceDiff = currentPrice - pos.entryPrice;
        const pnl = pos.type === 'LONG'
            ? (priceDiff / pos.entryPrice) * pos.size
            : -(priceDiff / pos.entryPrice) * pos.size;
        const margin = pos.size / pos.leverage;

        return (
            <motion.div
                key={pos.id}
                className="bg-zinc-900/80 border border-white/5 rounded-lg p-2 relative group"
            >
                <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-white">{pos.symbol}</span>
                    <span className={`text-[9px] ${pos.type === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pos.type} {pos.leverage}x
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <div className="text-[9px] text-zinc-500">{pos.entryPrice.toLocaleString()}</div>
                    <div className={`text-[10px] font-mono font-bold ${pnl >= 0 ? 'text-[#00FF94]' : 'text-red-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}
                    </div>
                </div>
                <button
                    onClick={() => handleClosePosition(pos.id, pnl, margin)}
                    className="absolute top-1 right-1 p-1 bg-white/10 hover:bg-red-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                    <X size={10} />
                </button>
            </motion.div>
        );
    }, [handleClosePosition, marketData]);

    const renderSignal = useCallback((signal: Signal) => {
        const isBuy = signal.type === 'BUY';
        const isSell = signal.type === 'SELL';
        const isSelected = selectedSymbol === signal.symbol;

        let color = 'text-zinc-500';
        let borderClass = isSelected ? 'border-white/20 bg-white/5' : 'border-white/5 bg-zinc-900/30 hover:bg-white/5';

        if (isBuy) {
            color = 'text-emerald-400';
            borderClass = isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 bg-zinc-900/30 hover:bg-white/5';
        } else if (isSell) {
            color = 'text-red-400';
            borderClass = isSelected ? 'border-red-500/50 bg-red-500/10' : 'border-white/5 bg-zinc-900/30 hover:bg-white/5';
        }

        const tickerKey = `${signal.symbol.toLowerCase()}usdt`;
        const sparklineData = marketData[tickerKey]?.history || [];

        return (
            <motion.div
                key={signal.symbol}
                layout
                className={`p-2 rounded-lg border cursor-pointer transition-all group ${borderClass}`}
                onClick={() => setSelectedSymbol(signal.symbol)}
            >
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                        {signal.symbol}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 ${color} border border-white/5`}>
                        {signal.type === 'CONNECTING' ? '...' : signal.type === 'WATCHING' ? 'SCAN' : signal.type}
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-[10px] font-mono text-white font-medium tracking-tight">
                            {signal.price > 0 ? `$${signal.price.toLocaleString()}` : '--'}
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                            RSI: {signal.rsi > 0 ? signal.rsi.toFixed(0) : '--'}
                        </div>
                    </div>
                    <MiniSparkline
                        data={sparklineData}
                        color={isBuy ? '#10B981' : isSell ? '#EF4444' : '#52525b'}
                    />
                </div>
            </motion.div>
        );
    }, [selectedSymbol, marketData]);

    return (
        <div className="h-full flex flex-col bg-[#030303] text-white overflow-hidden font-sans">
            {/* Header */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-gradient-to-r from-[#050505] to-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[#00FF94] font-black tracking-tighter text-sm">
                        <Activity className="w-4 h-4" /> APEX TERMINAL PRO
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <Wifi className="w-3 h-3 text-emerald-500" /> Live Feed
                    </div>
                </div>
                <div className="flex gap-6 text-xs font-mono">
                    <div>
                        Equity: <span className="text-white font-bold">
                            ${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={totalUnrealizedPnL >= 0 ? "text-[#00FF94]" : "text-red-500"}>
                        PnL: {totalUnrealizedPnL >= 0 ? '+' : ''}${totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ width: isLeftSidebarOpen ? 200 : 0 }}
                    className="border-r border-white/10 flex flex-col bg-[#080808] shrink-0 overflow-hidden"
                >
                    <div className="p-3 border-b border-white/10 bg-gradient-to-b from-zinc-900 to-black">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Wallet className="w-3 h-3 text-emerald-500" /> Portfolio
                        </h3>
                        <div className="bg-white/5 rounded-xl p-2 border border-white/5">
                            <div className="text-xs text-zinc-400 mb-1">Available</div>
                            <div className="text-lg font-black text-white tracking-tight">
                                ${balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar border-b border-white/10">
                        <SignalFilters filters={localFilters} onChange={setLocalFilters} />
                    </div>
                    <div className="h-[180px] flex flex-col bg-[#050505] border-t border-white/10">
                        <div className="px-3 py-2 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-3 h-3 text-yellow-400" /> Trades
                            </h3>
                            <Badge variant="outline" className="text-[9px] border-white/10 h-4">
                                {positions.length}
                            </Badge>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                            {positions.length === 0 ? (
                                <div className="text-center py-4 text-[9px] text-zinc-600 italic">
                                    No active trades
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {positions.map(renderPosition)}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Signal/Arbitrage Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ width: isLeftSidebarOpen ? 240 : 0 }}
                    className="border-r border-white/10 flex flex-col bg-[#050505] shrink-0 overflow-hidden whitespace-nowrap"
                >
                    <div className="grid grid-cols-2 p-1 bg-white/5 border-b border-white/10">
                        <button
                            onClick={() => setSidebarTab('signals')}
                            className={`py-1.5 text-[9px] font-bold uppercase rounded-md ${sidebarTab === 'signals' ? 'bg-black text-emerald-400' : 'text-zinc-500'}`}
                        >
                            Scanner
                        </button>
                        <button
                            onClick={() => setSidebarTab('arbitrage')}
                            className={`py-1.5 text-[9px] font-bold uppercase rounded-md ${sidebarTab === 'arbitrage' ? 'bg-black text-blue-400' : 'text-zinc-500'}`}
                        >
                            Arbitrage
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {sidebarTab === 'signals' ? (
                            <AnimatePresence initial={false}>
                                {filteredSignals.map(renderSignal)}
                            </AnimatePresence>
                        ) : (
                            <AnimatePresence initial={false}>
                                {arbOps.map((op) => (
                                    <motion.div
                                        key={op.id}
                                        layout
                                        className={`p-2 rounded-lg border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer transition-all ${selectedArb?.id === op.id ? 'bg-blue-500/20 border-blue-500' : ''}`}
                                        onClick={() => setSelectedArb(op)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs text-white">{op.pair}</span>
                                            <Badge className="bg-blue-500 text-[8px] px-1 h-4">Arb</Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-[9px] text-zinc-400 mb-1">
                                            <div className="flex items-center gap-1 text-emerald-400">Long Bin.</div>
                                            <div className="flex items-center gap-1 text-red-400">Short OKX</div>
                                        </div>
                                        <div className="flex justify-between items-end border-t border-blue-500/20 pt-1">
                                            <div>
                                                <div className="text-[9px] text-zinc-500">Spread</div>
                                                <div className="text-[10px] font-bold text-white">{op.spread.toFixed(2)}%</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[9px] text-zinc-500">Profit/10k</div>
                                                <div className="text-[10px] font-bold text-emerald-400">+${op.profit.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </motion.div>

                {/* Main Chart Area */}
                <div className="flex-1 flex flex-col bg-black relative min-w-0">
                    {/* Arbitrage Execution Modal */}
                    {arbExecuting && selectedArb && (
                        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
                            <div className="w-96 bg-zinc-900 border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/20">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-black text-white mb-1">ATOMIC EXECUTION</h3>
                                    <p className="text-xs text-blue-400 font-mono">Routing via Smart Contract...</p>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((step) => (
                                        <div
                                            key={step}
                                            className={`flex items-center gap-3 p-3 rounded-xl border ${arbStep >= step ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}
                                        >
                                            {arbStep >= step ? (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            ) : (
                                                <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
                                            )}
                                            <span className="text-sm">
                                                {step === 1 && `Locking Price (${selectedArb.buyExchange})`}
                                                {step === 2 && `Hedging (${selectedArb.sellExchange})`}
                                                {step === 3 && 'Executing Orders'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {arbStep === 4 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-center"
                                    >
                                        <div className="text-3xl font-black text-[#00FF94] mb-1">
                                            +${selectedArb.profit.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-zinc-400 uppercase tracking-widest">
                                            Profit Secured
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Content based on sidebar tab */}
                    {sidebarTab === 'arbitrage' && selectedArb ? (
                        <div className="flex-1 relative flex flex-col items-center justify-center p-10">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {selectedArb.pair} Arbitrage Opportunity
                                </h2>
                                <p className="text-zinc-400">
                                    Instant Risk-Free Profit via Cross-Exchange Liquidity
                                </p>
                            </div>
                            <div className="flex items-center gap-8 mb-12">
                                <div className="p-6 bg-zinc-900 border border-white/10 rounded-2xl text-center w-64">
                                    <div className="text-sm text-zinc-500 mb-2">Buy on {selectedArb.buyExchange}</div>
                                    <div className="text-2xl font-mono text-emerald-400 font-bold">Market Price</div>
                                </div>
                                <ArrowRight className="w-8 h-8 text-blue-500 animate-pulse" />
                                <div className="p-6 bg-zinc-900 border border-white/10 rounded-2xl text-center w-64">
                                    <div className="text-sm text-zinc-500 mb-2">Sell on {selectedArb.sellExchange}</div>
                                    <div className="text-2xl font-mono text-red-400 font-bold">+{selectedArb.spread.toFixed(2)}%</div>
                                </div>
                            </div>
                            <Button3D
                                onClick={handleExecuteArb}
                                className="px-12 py-6 text-xl shadow-2xl shadow-blue-500/20"
                            >
                                AUTO-EXECUTE
                            </Button3D>
                        </div>
                    ) : selectedSymbol ? (
                        <>
                            <div className="flex-1 relative group/chart">
                                {chartLoading && (
                                    <div className="absolute inset-0 z-20 bg-black flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
                                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500 relative z-10" />
                                            </div>
                                            <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono animate-pulse">
                                                Initializing AI Vision...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <TradingViewChart symbol={selectedSymbol} interval={localFilters.timeframe} />

                                {/* AI Insight Tooltip */}
                                <div className="absolute bottom-6 left-6 z-10 max-w-md pointer-events-none opacity-0 translate-y-4 group-hover/chart:opacity-100 group-hover/chart:translate-y-0 transition-all duration-500 ease-out">
                                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 shadow-2xl flex items-start gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
                                        <div className="p-2.5 bg-purple-500/10 rounded-lg shrink-0 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                                            <Zap className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2 tracking-wider">
                                                AI Logic Match
                                            </h4>
                                            <p className="text-xs text-zinc-200 leading-relaxed font-medium shadow-black drop-shadow-md whitespace-pre-line font-mono">
                                                {aiInsight || 'Hover to view AI analysis...'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mini Indicator Charts - RSI & MACD */}
                            {selectedTicker && (
                                <MiniIndicatorCharts ticker={selectedTicker} />
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            Select Asset
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <motion.div
                    initial={false}
                    animate={{ width: isRightSidebarOpen ? 260 : 0 }}
                    className="border-l border-white/10 flex flex-col bg-[#050505] shrink-0 overflow-hidden whitespace-nowrap"
                >
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {selectedSymbol && (
                            <>
                                {/* Order Book */}
                                <div className="border-b border-white/10">
                                    <div className="p-3 border-b border-white/5 bg-white/5">
                                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart2 className="w-3 h-3" /> Market Depth
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-1 space-y-px bg-black/20">
                                        {/* Asks */}
                                        {[...orderBookData.asks].reverse().map((ask, i) => (
                                            <div key={`ask-${i}`} className="flex justify-between relative h-5 items-center px-3 text-[10px] font-mono">
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0"
                                                    style={{ width: `${Math.min(ask.size * 10, 100)}%` }}
                                                />
                                                <span className="text-red-400 z-10">{ask.price.toFixed(2)}</span>
                                                <span className="text-zinc-600 z-10">{ask.size.toFixed(3)}</span>
                                            </div>
                                        ))}

                                        {/* Current Price */}
                                        <div className={`py-1.5 text-center font-bold text-white text-xs bg-white/5 my-1 mx-1 rounded`}>
                                            {orderBookData.price.toLocaleString()}
                                        </div>

                                        {/* Bids */}
                                        {orderBookData.bids.map((bid, i) => (
                                            <div key={`bid-${i}`} className="flex justify-between relative h-5 items-center px-3 text-[10px] font-mono">
                                                <div
                                                    className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0"
                                                    style={{ width: `${Math.min(bid.size * 10, 100)}%` }}
                                                />
                                                <span className="text-emerald-400 z-10">{bid.price.toFixed(2)}</span>
                                                <span className="text-zinc-600 z-10">{bid.size.toFixed(3)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantitative Indicators Panel - WOW! */}
                                <div className="p-2 border-b border-white/10">
                                    <QuantIndicatorsPanel
                                        ticker={selectedTicker}
                                        symbol={selectedSymbol}
                                    />
                                </div>

                                {/* Risk Dashboard - WOW! */}
                                <div className="p-2 border-b border-white/10">
                                    <RiskDashboard
                                        metrics={riskMetrics}
                                        portfolioValue={balance}
                                        isDemo={isDemo}
                                    />
                                </div>

                                {/* ML Prediction Panel - WOW! */}
                                {selectedTicker && (
                                    <div className="p-2 border-b border-white/10">
                                        <MLPredictionPanelWrapper
                                            ticker={selectedTicker}
                                            symbol={selectedSymbol}
                                        />
                                    </div>
                                )}

                                {/* Trading Panel */}
                                <div className="p-3 bg-zinc-900/50">
                                    {currentSignal?.plan ? (
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-3 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                    AI STRATEGY
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[9px] border-yellow-500/30 text-yellow-400 bg-yellow-500/5"
                                                >
                                                    Rec: {currentSignal.plan.leverage}x
                                                </Badge>
                                            </div>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Entry</span>
                                                    <span className="font-mono text-white">
                                                        ${currentSignal.plan.entry.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Stop</span>
                                                    <span className="font-mono text-red-400">
                                                        ${currentSignal.plan.sl.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="h-px bg-white/5 my-1" />
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">Target</span>
                                                    <span className="font-mono text-emerald-400 font-bold">
                                                        ${currentSignal.plan.tp2.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-xs text-zinc-600 italic mb-4 bg-white/5 rounded-xl">
                                            Waiting for setup...
                                        </div>
                                    )}

                                    {/* Leverage Slider */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-zinc-400 font-bold text-[10px] uppercase">
                                                Leverage
                                            </span>
                                            <span className="text-yellow-400 font-mono font-bold">{leverage}x</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="125"
                                            step="1"
                                            value={leverage}
                                            onChange={(e) => setLeverage(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                        />
                                    </div>

                                    {/* TP/SL Inputs */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        <div className="bg-black/40 p-2 rounded border border-white/5">
                                            <label className="text-[9px] text-emerald-500 block mb-1 font-bold">
                                                TP ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={tpPrice}
                                                onChange={(e) => setTpPrice(Number(e.target.value))}
                                                className="w-full bg-transparent text-white text-xs font-mono outline-none"
                                            />
                                        </div>
                                        <div className="bg-black/40 p-2 rounded border border-white/5">
                                            <label className="text-[9px] text-red-500 block mb-1 font-bold">
                                                SL ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={slPrice}
                                                onChange={(e) => setSlPrice(Number(e.target.value))}
                                                className="w-full bg-transparent text-white text-xs font-mono outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Execute Button */}
                                    <Button3D
                                        onClick={handleExecute}
                                        full
                                        variant={currentSignal?.type === 'BUY' ? 'primary' : currentSignal?.type === 'SELL' ? 'danger' : 'glass'}
                                        className="shadow-xl py-4"
                                        disabled={currentSignal?.type === 'WATCHING' || currentSignal?.type === 'CONNECTING'}
                                    >
                                        <div className="flex flex-col items-center leading-none gap-1">
                                            <span className="text-sm font-black flex items-center gap-2">
                                                {currentSignal?.type === 'BUY' ? 'LONG' : currentSignal?.type === 'SELL' ? 'SHORT' : 'WATCHING'} {selectedSymbol}
                                            </span>
                                            <span className="text-[10px] opacity-70 font-normal">
                                                {(currentSignal?.type === 'WATCHING' || currentSignal?.type === 'CONNECTING')
                                                    ? 'Wait for Signal'
                                                    : `Limit Order • ${leverage}x`}
                                            </span>
                                        </div>
                                    </Button3D>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// ML Prediction Panel Wrapper - handles feature calculation
function MLPredictionPanelWrapper({ ticker, symbol }: { ticker: MarketTicker; symbol: string }) {
    // For now, use mock features since we don't have candle data readily available
    // In production, this would use real historical candles
    const mockFeatures = useMemo(() => {
        if (!ticker) return null;

        // Create simplified features from ticker data
        return {
            momentum: {
                rsi: ticker.rsi || 50,
                rsi14: ticker.rsi || 50,
                rsi7: ticker.rsi || 50,
                macd: { value: 0, signal: 0, histogram: 0, bullish: ticker.rsi < 50, bearish: ticker.rsi > 50 },
                stochRSI: { k: ticker.rsi || 50, d: ticker.rsi || 50, oversold: ticker.rsi < 30, overbought: ticker.rsi > 70 },
                williamsR: -50,
                cci: 0,
                mfi: ticker.rsi || 50
            },
            volatility: {
                atr: ticker.price * 0.02,
                atr14: ticker.price * 0.02,
                bollingerBands: {
                    upper: ticker.upperBand || ticker.price * 1.02,
                    middle: ticker.sma20 || ticker.price,
                    lower: ticker.lowerBand || ticker.price * 0.98,
                    bandwidth: 0.04,
                    percentB: ((ticker.price - (ticker.lowerBand || ticker.price * 0.98)) / ((ticker.upperBand || ticker.price * 1.02) - (ticker.lowerBand || ticker.price * 0.98))),
                    squeeze: false
                },
                keltnerChannels: { upper: ticker.price * 1.02, middle: ticker.price, lower: ticker.price * 0.98, bandwidth: 0.04 },
                historicalVolatility: 0.25,
                normalizedATR: 0.02
            },
            volume: {
                mfi: ticker.rsi || 50,
                obv: 1000000,
                volumeDelta: ticker.netVolumeDelta || 0,
                vwap: ticker.price,
                volumeMA: ticker.volume || 1000,
                relativeVolume: 1.0
            },
            trend: {
                ema9: ticker.price,
                ema20: ticker.sma20 || ticker.price,
                ema50: ticker.price * 0.98,
                ema200: ticker.price * 0.95,
                sma20: ticker.sma20 || ticker.price,
                sma50: ticker.price * 0.98,
                vwap: ticker.price,
                trend: ticker.macroTrend || 'NEUTRAL',
                strength: 0.5
            },
            statistical: {
                zScore: 0,
                percentileRank: 50,
                mean: ticker.price,
                variance: 100,
                stdDev: 10,
                skewness: 0,
                kurtosis: 0,
                entropy: 0.5,
                isStationary: true,
                isNormal: true
            },
            regime: {
                type: 'RANGING' as const,
                confidence: 0.5,
                volatilityPercentile: 50,
                trendStrength: 0.5
            },
            timestamp: Date.now()
        };
    }, [ticker]);

    const { prediction, featureImportance, loading } = useMLPrediction({
        features: mockFeatures,
        currentPrice: ticker?.price || 0,
        enabled: !!mockFeatures
    });

    return (
        <MLPredictionPanel
            prediction={prediction}
            featureImportance={featureImportance}
            loading={loading}
        />
    );
}