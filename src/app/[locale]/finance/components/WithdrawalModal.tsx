"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaymentMethod } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Wallet, Building2, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    paymentMethods: PaymentMethod[];
    onSuccess: () => void;
}

type Step = 'method' | 'amount' | 'confirm' | 'success';

export function WithdrawalModal({ isOpen, onClose, balance, paymentMethods, onSuccess }: WithdrawalModalProps) {
    const [step, setStep] = useState<Step>('method');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reset = () => {
        setStep('method');
        setSelectedMethod(null);
        setAmount('');
        setIsSubmitting(false);
    };

    const handleClose = () => {
        onClose();
        setTimeout(reset, 300);
    };

    const handleMethodSelect = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setStep('amount');
    };

    const handleAmountSubmit = () => {
        if (!amount || parseFloat(amount) > balance || parseFloat(amount) < 10) return;
        setStep('confirm');
    };

    const handleConfirm = async () => {
        if (!selectedMethod || !amount) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/v1/user/finance/withdrawals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    payment_method_id: selectedMethod.id
                })
            });

            const data = await res.json();
            if (data.success) {
                setStep('success');
                onSuccess();
            } else {
                toast.error(data.message || 'Withdrawal failed');
                setIsSubmitting(false);
            }
        } catch (error) {
            toast.error('An error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px] bg-black/80 backdrop-blur-xl border-white/10 text-white p-0 overflow-hidden gap-0">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-blue-500/5 pointer-events-none" />

                <DialogHeader className="p-6 pb-2 relative z-10">
                    <div className="flex items-center gap-2">
                        {step !== 'method' && step !== 'success' && (
                            <button
                                onClick={() => setStep(step === 'confirm' ? 'amount' : 'method')}
                                className="p-1 rounded-full hover:bg-white/10 transition-colors -ml-2 mr-1"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-400" />
                            </button>
                        )}
                        <DialogTitle className="text-xl font-bold tracking-tight">
                            {step === 'method' && 'Select Withdrawal Method'}
                            {step === 'amount' && 'Enter Amount'}
                            {step === 'confirm' && 'Confirm Withdrawal'}
                            {step === 'success' && 'Success!'}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-2 relative z-10 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {step === 'method' && (
                            <motion.div
                                key="method"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <p className="text-sm text-gray-400 mb-4">Choose where you want to send your funds.</p>
                                <div className="grid gap-3">
                                    {paymentMethods.map((pm) => (
                                        <button
                                            key={pm.id}
                                            onClick={() => handleMethodSelect(pm)}
                                            className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 transition-all group text-left w-full"
                                        >
                                            <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                                                {pm.type === 'crypto_wallet' ? <Wallet className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{pm.name}</div>
                                                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                                    {pm.type === 'crypto_wallet' ? pm.details.address : pm.details.account_number}
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-gray-500 ml-auto group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                    {paymentMethods.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No payment methods found. Please add one in Settings.
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 'amount' && (
                            <motion.div
                                key="amount"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                                    <div className="text-3xl font-bold text-emerald-400">${balance.toFixed(2)}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500">$</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-transparent border-b-2 border-white/10 focus:border-emerald-500 text-4xl py-4 pl-10 pr-4 text-white placeholder-gray-700 outline-none transition-colors font-bold"
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 px-2">
                                        <span>Min: $10.00</span>
                                        <button onClick={() => setAmount(balance.toString())} className="text-emerald-500 hover:text-emerald-400 font-medium">
                                            Max
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAmountSubmit}
                                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 text-lg rounded-xl mt-4"
                                >
                                    Continue
                                </Button>
                            </motion.div>
                        )}

                        {step === 'confirm' && (
                            <motion.div
                                key="confirm"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Amount</span>
                                        <span className="text-xl font-bold text-white">${parseFloat(amount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Method</span>
                                        <span className="text-white">{selectedMethod?.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Fee</span>
                                        <span className="text-emerald-400">Free</span>
                                    </div>
                                    <div className="h-px bg-white/10" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">Total</span>
                                        <span className="text-xl font-bold text-emerald-400">${parseFloat(amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleConfirm}
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        'Confirm Withdrawal'
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-center space-y-6"
                            >
                                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                        <Check className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Withdrawal Initiated</h3>
                                    <p className="text-gray-400">Your funds are on the way!</p>
                                </div>
                                <Button
                                    onClick={handleClose}
                                    className="bg-white/10 hover:bg-white/20 text-white w-full max-w-[200px]"
                                >
                                    Done
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
