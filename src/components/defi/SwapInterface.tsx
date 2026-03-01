'use client';

import { useState, useMemo } from 'react';
import { ArrowDown, Settings, Info, Loader2, Zap, ChevronDown, Clock } from 'lucide-react';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from './WalletConnectButton';
import { RAAS_CONFIG, UNIFIED_TIERS } from '@apex-os/vibe-payment';

const ETH_PRICE = 3000;
const SPREAD_RATE = UNIFIED_TIERS.EXPLORER.spreadBps / 10000; // 0.30%
const REBATE_RATE = UNIFIED_TIERS.EXPLORER.selfRebateRate;    // 10%
const BINANCE_FEE_RATE = 0.001; // 0.10%

const CHAIN_LABELS: Record<string, string> = {
  ethereum: 'ETH', bsc: 'BSC', polygon: 'POL', solana: 'SOL', tron: 'TRX',
};

export default function SwapInterface() {
  const { isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState('');
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [swapDone, setSwapDone] = useState(false);

  const usdValue = Number(fromAmount || 0) * ETH_PRICE;
  const toAmount = usdValue > 0 ? (usdValue * (1 - SPREAD_RATE + SPREAD_RATE * REBATE_RATE)).toFixed(2) : '';

  const breakdown = useMemo(() => {
    if (!usdValue) return null;
    const spreadCost = usdValue * SPREAD_RATE;
    const rebate = spreadCost * REBATE_RATE;
    const netCost = spreadCost - rebate;
    const binanceFee = usdValue * BINANCE_FEE_RATE;
    return {
      spreadPct: (SPREAD_RATE * 100).toFixed(2),
      spreadCost: spreadCost.toFixed(2),
      rebate: rebate.toFixed(2),
      netCost: netCost.toFixed(2),
      binanceFee: binanceFee.toFixed(2),
      savings: (binanceFee - netCost).toFixed(2),
    };
  }, [usdValue]);

  const handleSwap = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setFromAmount('');
      setSwapDone(true);
      setTimeout(() => setSwapDone(false), 3000);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold">Swap</h2>
            <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Zap className="h-2.5 w-2.5" /> ZERO FEES
            </span>
          </div>
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Chain Selector */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
          {RAAS_CONFIG.cryptoGate.chains.map((chain) => (
            <button
              key={chain}
              onClick={() => setSelectedChain(chain)}
              className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                selectedChain === chain
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {CHAIN_LABELS[chain]}
            </button>
          ))}
        </div>

        {/* From Token */}
        <div className="bg-white/5 p-4 rounded-xl mb-2 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400">You pay</span>
            <span className="text-xs text-gray-400">Balance: 1.45 ETH</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <input
              type="number"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="bg-transparent text-3xl font-bold text-white outline-none w-full placeholder-gray-600"
            />
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">E</div>
              <span className="text-white font-bold">ETH</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">≈ ${usdValue.toLocaleString()}</div>
        </div>

        {/* Direction Button */}
        <div className="flex justify-center -my-4 relative z-10">
          <button className="p-2 bg-[#1a1b1e] border border-white/10 rounded-xl hover:scale-110 transition-transform">
            <ArrowDown className="h-4 w-4 text-blue-500" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-white/5 p-4 rounded-xl mt-2 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400">You receive</span>
            <span className="text-xs text-gray-400">Balance: 0.00 USDT</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="text-3xl font-bold text-white w-full">{toAmount || '0'}</div>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold">T</div>
              <span className="text-white font-bold">USDT</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">≈ ${toAmount || '0'}</div>
        </div>

        {/* Spread Breakdown */}
        {breakdown && (
          <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5 space-y-1.5">
            <div className="flex items-center gap-1 mb-2">
              <Info className="h-3 w-3 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spread Breakdown</span>
            </div>
            <Row label="Trade amount" value={`$${usdValue.toLocaleString()}`} />
            <Row label={`Spread rate`} value={`${breakdown.spreadPct}%`} valueClass="text-gray-300" />
            <Row label="Spread cost" value={`-$${breakdown.spreadCost}`} valueClass="text-red-400" />
            <Row label={`Your rebate (${REBATE_RATE * 100}%)`} value={`+$${breakdown.rebate}`} valueClass="text-emerald-400" />
            <div className="border-t border-white/10 pt-1.5">
              <Row label="Net cost" value={`$${breakdown.netCost}`} valueClass="text-white font-bold" />
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 bg-emerald-500/10 rounded-lg px-2 py-1.5">
              <span className="text-emerald-400">vs Binance fee: ${breakdown.binanceFee}</span>
              <span className="text-emerald-400 font-bold">Save ${breakdown.savings}</span>
            </div>
          </div>
        )}

        {/* Settlement + Tokens */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Settlement {RAAS_CONFIG.cryptoGate.settlementTime}</span>
          </div>
          <div className="flex gap-1">
            {RAAS_CONFIG.cryptoGate.stablecoins.slice(0, 3).map((t) => (
              <span key={t} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-400">{t}</span>
            ))}
          </div>
        </div>

        {/* Toast */}
        {swapDone && (
          <div className="mt-3 text-center text-sm text-emerald-400 font-bold bg-emerald-500/10 rounded-xl py-2 border border-emerald-500/20">
            Swap executed successfully
          </div>
        )}

        {/* Action */}
        <div className="mt-3">
          {!isConnected ? (
            <div className="w-full"><WalletConnectButton /></div>
          ) : (
            <button
              onClick={handleSwap}
              disabled={!fromAmount || isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /> Swapping...</> : 'Swap'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = 'text-gray-300' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between text-[11px]">
      <span className="text-gray-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
