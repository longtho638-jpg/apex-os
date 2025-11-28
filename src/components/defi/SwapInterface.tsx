'use client';

import React, { useState } from 'react';
import { ArrowDown, Settings, Info, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { WalletConnectButton } from './WalletConnectButton';

export default function SwapInterface() {
    const { isConnected } = useAccount();
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSwap = () => {
        setIsLoading(true);
        // Mock transaction delay
        setTimeout(() => {
            setIsLoading(false);
            setFromAmount('');
            setToAmount('');
            alert('Swap successful (Mock)');
        }, 2000);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-white font-bold">Swap</h2>
                    <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                        <Settings className="h-5 w-5" />
                    </button>
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
                            <ArrowDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">≈ ${Number(fromAmount || 0) * 3000}</div>
                </div>

                {/* Swap Direction Button */}
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
                        <input
                            type="number"
                            placeholder="0"
                            value={toAmount}
                            onChange={(e) => setToAmount(e.target.value)}
                            className="bg-transparent text-3xl font-bold text-white outline-none w-full placeholder-gray-600"
                        />
                        <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors shrink-0">
                            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold">T</div>
                            <span className="text-white font-bold">USDT</span>
                            <ArrowDown className="h-4 w-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">≈ ${Number(toAmount || 0)}</div>
                </div>

                {/* Price Info */}
                {fromAmount && (
                    <div className="flex items-center justify-between px-2 py-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            <span>1 ETH = 3,000 USDT</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-green-400">Free (Gas refunded)</span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-2">
                    {!isConnected ? (
                        <div className="w-full">
                            <WalletConnectButton />
                        </div>
                    ) : (
                        <button
                            onClick={handleSwap}
                            disabled={!fromAmount || isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Swapping...
                                </>
                            ) : (
                                'Swap'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
