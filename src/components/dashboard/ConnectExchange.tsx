"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronRight, Check, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Exchange = 'binance' | 'bybit' | 'okx';

export default function ConnectExchange() {
    const [step, setStep] = useState<'select' | 'input' | 'connecting' | 'success'>('select');
    const [selectedExchange, setSelectedExchange] = useState<Exchange>('binance');
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleConnect = async () => {
        if (!apiKey || !apiSecret) {
            setError("API Key and Secret are required");
            return;
        }

        setStep('connecting');
        setError(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // In production:
            // const res = await fetch('/api/exchange/connect', {
            //     method: 'POST',
            //     body: JSON.stringify({ exchange: selectedExchange, apiKey, apiSecret })
            // });
            // if (!res.ok) throw new Error('Connection failed');

            setStep('success');
        } catch (err) {
            setError("Failed to connect. Please check your credentials.");
            setStep('input');
        }
    };

    return (
        <div className="rounded-xl border border-[#00FF00]/30 bg-[#00FF00]/5 p-8 relative overflow-hidden group">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-32 bg-[#00FF00]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-[#00FF00]/20 transition-all duration-500" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,255,0,0.03)_10px,rgba(0,255,0,0.03)_20px)]" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-[#00FF00]/10 border border-[#00FF00]/20">
                        <Wallet className="h-6 w-6 text-[#00FF00]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold font-mono">EXCHANGE_UPLINK</h3>
                        <p className="text-xs text-gray-500 font-mono">SECURE_CONNECTION_PROTOCOL</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <p className="text-gray-400 text-sm max-w-xl">
                                Connect your exchange account to enable real-time tracking, automated auditing, and rebate optimization.
                            </p>

                            <div className="grid grid-cols-3 gap-4">
                                {(['binance', 'bybit', 'okx'] as Exchange[]).map((ex) => (
                                    <button
                                        key={ex}
                                        onClick={() => {
                                            setSelectedExchange(ex);
                                            setStep('input');
                                        }}
                                        className="flex flex-col items-center justify-center p-4 rounded-lg border border-white/10 bg-black/40 hover:border-[#00FF00]/50 hover:bg-[#00FF00]/5 transition-all group/btn"
                                    >
                                        <span className="capitalize font-mono font-bold text-gray-300 group-hover/btn:text-[#00FF00]">{ex}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'input' && (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-mono text-[#00FF00]">TARGET: {selectedExchange.toUpperCase()}</span>
                                <button
                                    onClick={() => setStep('select')}
                                    className="text-xs text-gray-500 hover:text-white"
                                >
                                    CHANGE
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500 font-mono mb-1 block">API_KEY</label>
                                    <input
                                        type="text"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-[#00FF00] transition-colors"
                                        placeholder="Enter API Key"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-mono mb-1 block">API_SECRET</label>
                                    <input
                                        type="password"
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-[#00FF00] transition-colors"
                                        placeholder="Enter API Secret"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
                                    <AlertCircle className="h-3 w-3" />
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <Lock className="h-3 w-3" />
                                <span>Keys are encrypted using AES-256 before storage.</span>
                            </div>

                            <button
                                onClick={handleConnect}
                                className="w-full bg-[#00FF00] text-black font-bold font-mono py-3 rounded-lg hover:bg-[#00FF00]/90 transition-colors flex items-center justify-center gap-2"
                            >
                                ESTABLISH_UPLINK
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )}

                    {step === 'connecting' && (
                        <motion.div
                            key="connecting"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 space-y-4"
                        >
                            <RefreshCw className="h-8 w-8 text-[#00FF00] animate-spin" />
                            <div className="text-center">
                                <div className="text-[#00FF00] font-mono font-bold">VERIFYING CREDENTIALS...</div>
                                <div className="text-xs text-gray-500 font-mono mt-1">Handshaking with {selectedExchange}...</div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-8 space-y-4"
                        >
                            <div className="h-12 w-12 rounded-full bg-[#00FF00]/20 flex items-center justify-center border border-[#00FF00]">
                                <Check className="h-6 w-6 text-[#00FF00]" />
                            </div>
                            <div className="text-center">
                                <div className="text-[#00FF00] font-mono font-bold text-lg">UPLINK ESTABLISHED</div>
                                <div className="text-xs text-gray-400 font-mono mt-2 max-w-xs mx-auto">
                                    Syncing trade history... This may take up to 5 minutes. You will be notified when analysis is ready.
                                </div>
                            </div>
                            <button
                                onClick={() => setStep('select')}
                                className="text-xs text-gray-500 hover:text-white underline font-mono"
                            >
                                Connect Another Exchange
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
