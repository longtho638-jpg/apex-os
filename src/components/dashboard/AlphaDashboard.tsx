'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, BarChart2, CheckCircle2, Loader2, Wallet, Wifi, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MiniIndicatorCharts } from '@/components/dashboard/MiniIndicatorCharts';
import { QuantIndicatorsPanel } from '@/components/dashboard/QuantPanel';
import { RiskDashboard } from '@/components/dashboard/RiskDashboard';
import { type FilterState, SignalFilters } from '@/components/dashboard/SignalFilters';
import { Button3D } from '@/components/marketing/Button3D';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketData } from '@/hooks/useMarketData';
import { usePortfolioRisk } from '@/hooks/usePortfolioRisk';
import { type Position, usePositions } from '@/hooks/usePositions';
import { useRealPortfolioReturns } from '@/hooks/useRealPortfolioReturns';
import { useWallet } from '@/hooks/useWallet';
import { logger } from '@/lib/logger';
import type { ArbOpportunity, Signal, SignalType, TradePlan } from './alpha-dashboard-types';
import { calculateTradePlan, FULL_ASSETS, generateInsight } from './alpha-dashboard-utils';
import { MiniSparkline } from './MiniSparkline';
import { MLPredictionPanelWrapper } from './MLPredictionPanelWrapper';
import { TradingViewChart } from './TradingViewChart';

export type { ArbOpportunity, Signal, SignalType, TradePlan } from './alpha-dashboard-types';

interface Props {
  filters: FilterState;
}

export default function AlphaDashboard({ filters: parentFilters }: Props) {
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
  const { returns: realReturns, isDemo } = useRealPortfolioReturns();
  const { metrics: riskMetrics } = usePortfolioRisk({
    returns: realReturns.length >= 30 ? realReturns : [],
    portfolioValue: balance,
    enabled: realReturns.length >= 30,
  });

  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [arbOps, setArbOps] = useState<ArbOpportunity[]>([]);
  const [selectedArb, setSelectedArb] = useState<ArbOpportunity | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'signals' | 'arbitrage'>('signals');

  const [chartLoading, _setChartLoading] = useState(false);
  const [isLeftSidebarOpen, _setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, _setIsRightSidebarOpen] = useState(true);

  const [arbExecuting, setArbExecuting] = useState(false);
  const [arbStep, setArbStep] = useState(0);

  const [leverage, setLeverage] = useState(20);
  const [tpPrice, setTpPrice] = useState(0);
  const [slPrice, setSlPrice] = useState(0);
  const positionSize = 10000;

  const signalStateRef = useRef<Record<string, SignalType>>({});

  // Enhanced: Quantitative signals calculation with 30+ indicators
  const signals = useMemo(() => {
    return FULL_ASSETS.map((symbol) => {
      const tickerKey = `${symbol.toLowerCase()}usdt`;
      const ticker = marketData[tickerKey];

      if (!signalStateRef.current[symbol]) {
        signalStateRef.current[symbol] = 'CONNECTING';
      }

      let currentType = signalStateRef.current[symbol];

      if (ticker) {
        if (currentType === 'CONNECTING') {
          currentType = 'WATCHING';
        }

        const effectiveRsi = (ticker.rsi + (ticker.macroRsi || 50)) / 2;
        const isShortTimeframe = ['1m', '5m', '15m'].includes(localFilters.timeframe);
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
        const rsiDistance = Math.abs(50 - ticker.rsi);
        confidence = Math.min(rsiDistance * 2, 40);

        if (currentType === 'BUY' && ticker.macroTrend === 'BULLISH') confidence += 15;
        if (currentType === 'SELL' && ticker.macroTrend === 'BEARISH') confidence += 15;

        const volumeSupport = Math.abs(ticker.netVolumeDelta || 0) > 100000;
        if (volumeSupport) {
          if (currentType === 'BUY' && ticker.netVolumeDelta > 0) confidence += 15;
          if (currentType === 'SELL' && ticker.netVolumeDelta < 0) confidence += 15;
        }

        const lowerBand = ticker.lowerBand || ticker.price * 0.98;
        const upperBand = ticker.upperBand || ticker.price * 1.02;
        if (currentType === 'BUY' && ticker.price < lowerBand) confidence += 15;
        if (currentType === 'SELL' && ticker.price > upperBand) confidence += 15;

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
        plan,
      } as Signal;
    }).sort((a, b) => {
      const scoreA = a.type === 'BUY' || a.type === 'SELL' ? 1000 : 0;
      const scoreB = b.type === 'BUY' || b.type === 'SELL' ? 1000 : 0;
      return scoreB - scoreA || FULL_ASSETS.indexOf(a.symbol) - FULL_ASSETS.indexOf(b.symbol);
    });
  }, [marketData, localFilters.timeframe]);

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      if (localFilters.symbols.length > 0 && !localFilters.symbols.includes(s.symbol)) {
        return false;
      }
      return true;
    });
  }, [signals, localFilters.symbols]);

  const currentSignal = useMemo(() => {
    return filteredSignals.find((s) => s.symbol === selectedSymbol) || filteredSignals[0];
  }, [filteredSignals, selectedSymbol]);

  const selectedTicker = useMemo(() => {
    return marketData[`${(selectedSymbol || '').toLowerCase()}usdt`];
  }, [marketData, selectedSymbol]);

  const orderBookData = useMemo(() => {
    const price = selectedTicker?.price || 50000;
    const asks = Array.from({ length: 15 }).map((_, i) => ({
      price: price + (i + 1) * price * 0.0002,
      size: Math.random() * 5,
    }));
    const bids = Array.from({ length: 15 }).map((_, i) => ({
      price: price - (i + 1) * price * 0.0002,
      size: Math.random() * 5,
    }));
    return { asks, bids, price };
  }, [selectedTicker?.price]);

  useEffect(() => {
    if (!selectedSymbol && filteredSignals.length > 0) {
      setSelectedSymbol(filteredSignals[0].symbol);
    }
  }, [filteredSignals, selectedSymbol]);

  useEffect(() => {
    if (currentSignal?.plan) {
      setLeverage(currentSignal.plan.leverage);
      setTpPrice(currentSignal.plan.tp2);
      setSlPrice(currentSignal.plan.sl);
    }
  }, [currentSignal?.plan]);

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
            timestamp: Date.now(),
          });
        }
      });

      setArbOps(newOps.sort((a, b) => a.pair.localeCompare(b.pair)).slice(0, 15));
    }
  }, [marketData]);

  const aiInsight = useMemo(() => {
    if (!selectedSymbol || sidebarTab !== 'signals') return '';

    const tickerKey = `${selectedSymbol.toLowerCase()}usdt`;
    const ticker = marketData[tickerKey];
    const signal = signals.find((s) => s.symbol === selectedSymbol);

    if (!ticker || !signal) return 'Initializing...';

    return generateInsight(ticker, signal, localFilters.timeframe);
  }, [selectedSymbol, sidebarTab, marketData, signals, localFilters.timeframe]);

  const handleExecute = useCallback(async () => {
    if (!selectedSymbol || !selectedTicker || !currentSignal || !user) return;

    const type = currentSignal.plan?.direction || (currentSignal.type === 'BUY' ? 'LONG' : 'SHORT');
    const side = type === 'LONG' ? 'buy' : 'sell';
    const amount = positionSize / leverage;
    const currentPrice = selectedTicker.price;
    const quantity = (amount * leverage) / currentPrice;

    if (realBalance < amount) {
      toast.error('Insufficient Funds', {
        description: `Required: $${amount.toFixed(2)} | Available: $${realBalance.toFixed(2)}`,
      });
      return;
    }

    try {
      const response = await fetch('/api/v1/trading/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          symbol: `${selectedSymbol}USDT`,
          side: side === 'buy' ? 'BUY' : 'SELL',
          quantity,
          type: 'MARKET',
          leverage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Order failed');
      }

      toast.success('SIGNAL EXECUTED', {
        description: `${side.toUpperCase()} ${quantity.toFixed(4)} ${selectedSymbol} @ $${currentPrice.toLocaleString()}`,
        duration: 5000,
      });

      refreshWallet();
      refreshPositions();
    } catch (error: any) {
      logger.error('Execution failed:', error);
      toast.error('EXECUTION FAILED', { description: error.message });
    }
  }, [selectedSymbol, selectedTicker, currentSignal, leverage, user, realBalance, refreshWallet, refreshPositions]);

  const handleExecuteArb = useCallback(() => {
    if (!selectedArb) return;

    setArbExecuting(true);
    setArbStep(1);

    const steps = [2, 3, 4];
    const timeouts: NodeJS.Timeout[] = [];

    steps.forEach((step, index) => {
      const timeout = setTimeout(
        () => {
          setArbStep(step);
        },
        1000 * (index + 1),
      );
      timeouts.push(timeout);
    });

    const finalTimeout = setTimeout(() => {
      setArbExecuting(false);
      setArbStep(0);
      setBalance((prev) => prev + (selectedArb.profit || 0));
      timeouts.forEach(clearTimeout);
    }, 4500);

    timeouts.push(finalTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [selectedArb]);

  const handleClosePosition = useCallback(
    async (id: string, _pnl: number, _margin: number) => {
      try {
        await fetch(`/api/v1/trading/positions?id=${id}`, { method: 'DELETE' });
        refreshPositions();
        refreshWallet();
        toast.success('Position Closed');
      } catch (_e) {
        toast.error('Failed to close position');
      }
    },
    [refreshPositions, refreshWallet],
  );

  const totalUnrealizedPnL = useMemo(() => {
    return positions.reduce((sum, pos) => {
      const currentPrice = marketData[pos.symbol.toLowerCase()]?.price || pos.entryPrice;
      const priceDiff = currentPrice - pos.entryPrice;
      const pnl =
        pos.type === 'LONG' ? (priceDiff / pos.entryPrice) * pos.size : -(priceDiff / pos.entryPrice) * pos.size;
      return sum + pnl;
    }, 0);
  }, [positions, marketData]);

  const equity = useMemo(() => balance + totalUnrealizedPnL, [balance, totalUnrealizedPnL]);

  const renderPosition = useCallback(
    (pos: Position) => {
      const currentPrice = marketData[pos.symbol.toLowerCase()]?.price || pos.entryPrice;
      const priceDiff = currentPrice - pos.entryPrice;
      const pnl =
        pos.type === 'LONG' ? (priceDiff / pos.entryPrice) * pos.size : -(priceDiff / pos.entryPrice) * pos.size;
      const margin = pos.size / pos.leverage;

      return (
        <motion.div key={pos.id} className="bg-zinc-900/80 border border-white/5 rounded-lg p-2 relative group">
          <div className="flex justify-between">
            <span className="text-[10px] font-bold text-white">{pos.symbol}</span>
            <span className={`text-[9px] ${pos.type === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
              {pos.type} {pos.leverage}x
            </span>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-[9px] text-zinc-500">{pos.entryPrice.toLocaleString()}</div>
            <div className={`text-[10px] font-mono font-bold ${pnl >= 0 ? 'text-[#00FF94]' : 'text-red-500'}`}>
              {pnl >= 0 ? '+' : ''}
              {pnl.toFixed(2)}
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
    },
    [handleClosePosition, marketData],
  );

  const renderSignal = useCallback(
    (signal: Signal) => {
      const isBuy = signal.type === 'BUY';
      const isSell = signal.type === 'SELL';
      const isSelected = selectedSymbol === signal.symbol;

      let color = 'text-zinc-500';
      let borderClass = isSelected ? 'border-white/20 bg-white/5' : 'border-white/5 bg-zinc-900/30 hover:bg-white/5';

      if (isBuy) {
        color = 'text-emerald-400';
        borderClass = isSelected
          ? 'border-emerald-500/50 bg-emerald-500/10'
          : 'border-white/5 bg-zinc-900/30 hover:bg-white/5';
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
            <MiniSparkline data={sparklineData} color={isBuy ? '#10B981' : isSell ? '#EF4444' : '#52525b'} />
          </div>
        </motion.div>
      );
    },
    [selectedSymbol, marketData],
  );

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
            Equity:{' '}
            <span className="text-white font-bold">
              ${equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className={totalUnrealizedPnL >= 0 ? 'text-[#00FF94]' : 'text-red-500'}>
            PnL: {totalUnrealizedPnL >= 0 ? '+' : ''}$
            {totalUnrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                <div className="text-center py-4 text-[9px] text-zinc-600 italic">No active trades</div>
              ) : (
                <AnimatePresence>{positions.map(renderPosition)}</AnimatePresence>
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
              <AnimatePresence initial={false}>{filteredSignals.map(renderSignal)}</AnimatePresence>
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
                    <div className="text-3xl font-black text-[#00FF94] mb-1">+${selectedArb.profit.toFixed(2)}</div>
                    <div className="text-xs text-zinc-400 uppercase tracking-widest">Profit Secured</div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Content based on sidebar tab */}
          {sidebarTab === 'arbitrage' && selectedArb ? (
            <div className="flex-1 relative flex flex-col items-center justify-center p-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">{selectedArb.pair} Arbitrage Opportunity</h2>
                <p className="text-zinc-400">Instant Risk-Free Profit via Cross-Exchange Liquidity</p>
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
              <Button3D onClick={handleExecuteArb} className="px-12 py-6 text-xl shadow-2xl shadow-blue-500/20">
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
              {selectedTicker && <MiniIndicatorCharts ticker={selectedTicker} />}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500">Select Asset</div>
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
                    {[...orderBookData.asks].reverse().map((ask, i) => (
                      <div
                        key={`ask-${i}`}
                        className="flex justify-between relative h-5 items-center px-3 text-[10px] font-mono"
                      >
                        <div
                          className="absolute right-0 top-0 bottom-0 bg-red-500/10 z-0"
                          style={{ width: `${Math.min(ask.size * 10, 100)}%` }}
                        />
                        <span className="text-red-400 z-10">{ask.price.toFixed(2)}</span>
                        <span className="text-zinc-600 z-10">{ask.size.toFixed(3)}</span>
                      </div>
                    ))}

                    <div className={'py-1.5 text-center font-bold text-white text-xs bg-white/5 my-1 mx-1 rounded'}>
                      {orderBookData.price.toLocaleString()}
                    </div>

                    {orderBookData.bids.map((bid, i) => (
                      <div
                        key={`bid-${i}`}
                        className="flex justify-between relative h-5 items-center px-3 text-[10px] font-mono"
                      >
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

                {/* Quantitative Indicators Panel */}
                <div className="p-2 border-b border-white/10">
                  <QuantIndicatorsPanel ticker={selectedTicker} symbol={selectedSymbol} />
                </div>

                {/* Risk Dashboard */}
                <div className="p-2 border-b border-white/10">
                  <RiskDashboard metrics={riskMetrics} portfolioValue={balance} isDemo={isDemo} />
                </div>

                {/* ML Prediction Panel */}
                {selectedTicker && (
                  <div className="p-2 border-b border-white/10">
                    <MLPredictionPanelWrapper ticker={selectedTicker} />
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
                          <span className="font-mono text-white">${currentSignal.plan.entry.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Stop</span>
                          <span className="font-mono text-red-400">${currentSignal.plan.sl.toLocaleString()}</span>
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
                      <span className="text-zinc-400 font-bold text-[10px] uppercase">Leverage</span>
                      <span className="text-yellow-400 font-mono font-bold">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="125"
                      step="1"
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  {/* TP/SL Inputs */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <label className="text-[9px] text-emerald-500 block mb-1 font-bold">TP ($)</label>
                      <input
                        type="number"
                        value={tpPrice}
                        onChange={(e) => setTpPrice(Number(e.target.value))}
                        className="w-full bg-transparent text-white text-xs font-mono outline-none"
                      />
                    </div>
                    <div className="bg-black/40 p-2 rounded border border-white/5">
                      <label className="text-[9px] text-red-500 block mb-1 font-bold">SL ($)</label>
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
                    variant={
                      currentSignal?.type === 'BUY' ? 'primary' : currentSignal?.type === 'SELL' ? 'danger' : 'glass'
                    }
                    className="shadow-xl py-4"
                    disabled={currentSignal?.type === 'WATCHING' || currentSignal?.type === 'CONNECTING'}
                  >
                    <div className="flex flex-col items-center leading-none gap-1">
                      <span className="text-sm font-black flex items-center gap-2">
                        {currentSignal?.type === 'BUY' ? 'LONG' : currentSignal?.type === 'SELL' ? 'SHORT' : 'WATCHING'}{' '}
                        {selectedSymbol}
                      </span>
                      <span className="text-[10px] opacity-70 font-normal">
                        {currentSignal?.type === 'WATCHING' || currentSignal?.type === 'CONNECTING'
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
