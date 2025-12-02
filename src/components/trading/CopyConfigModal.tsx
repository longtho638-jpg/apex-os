import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CopyConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    leaderName: string;
    leaderWinRate: number;
    onConfirm: (amount: number, stopLoss: number) => Promise<void>;
}

export function CopyConfigModal({ isOpen, onClose, leaderName, leaderWinRate, onConfirm }: CopyConfigModalProps) {
    const [amount, setAmount] = useState(1000);
    const [stopLoss, setStopLoss] = useState(20);
    const [step, setStep] = useState<'config' | 'syncing' | 'success'>('config');

    const projectedMonthlyReturn = (amount * (leaderWinRate / 100) * 0.15); // Simple projection logic

    const handleConfirm = async () => {
        setStep('syncing');
        // Simulate network delay for "Connecting" effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        await onConfirm(amount, stopLoss);
        setStep('success');
        // Close after showing success
        setTimeout(() => {
            onClose();
            setStep('config'); // Reset for next time
        }, 1500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
                <AnimatePresence mode="wait">
                    {step === 'config' && (
                        <motion.div
                            key="config"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    Copying <span className="text-[#00FF94]">{leaderName}</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="grid gap-6 py-6">
                                {/* Investment Amount */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label>Investment Amount (USDT)</Label>
                                        <span className="font-mono font-bold text-[#00FF94]">${amount.toLocaleString()}</span>
                                    </div>
                                    <Slider
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                        min={100}
                                        max={10000}
                                        step={100}
                                        className="py-2"
                                    />
                                    <div className="flex justify-between text-xs text-zinc-500">
                                        <span>$100</span>
                                        <span>$10,000</span>
                                    </div>
                                </div>

                                {/* Stop Loss */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-red-400" />
                                            Hard Stop Loss
                                        </Label>
                                        <span className="font-mono font-bold text-red-400">-{stopLoss}%</span>
                                    </div>
                                    <Slider
                                        value={stopLoss}
                                        onChange={(e) => setStopLoss(Number(e.target.value))}
                                        min={5}
                                        max={50}
                                        step={5}
                                        className="py-2"
                                    />
                                    <p className="text-[10px] text-zinc-500">
                                        If your equity drops by {stopLoss}%, copying will automatically stop.
                                    </p>
                                </div>

                                {/* Projection */}
                                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-900/20 to-cyan-900/20 border border-emerald-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-[#00FF94]" />
                                        <span className="text-sm font-bold text-zinc-300">Projected Monthly Return</span>
                                    </div>
                                    <div className="text-2xl font-bold text-white">
                                        ~${projectedMonthlyReturn.toFixed(0)} <span className="text-sm font-normal text-zinc-500">/mo</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1">
                                        Based on leader's {leaderWinRate}% win rate. Past performance is not a guarantee.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={onClose} className="border-zinc-700 hover:bg-zinc-800">Cancel</Button>
                                <Button onClick={handleConfirm} className="bg-[#00FF94] text-black hover:bg-[#00CC76] font-bold">
                                    Confirm Copy
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    )}

                    {step === 'syncing' && (
                        <motion.div
                            key="syncing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="py-12 flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-[#00FF94]/20 rounded-full blur-xl animate-pulse" />
                                <Loader2 className="w-16 h-16 text-[#00FF94] animate-spin relative z-10" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Syncing Portfolio...</h3>
                            <p className="text-zinc-400 text-sm">Allocating funds and establishing connection.</p>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center justify-center text-center"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">You are now copying!</h3>
                            <p className="text-zinc-400 text-sm">Trades will appear in your dashboard automatically.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
