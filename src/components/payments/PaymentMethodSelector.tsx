'use client';

import { Bitcoin, CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'polar' | 'nowpayments' | 'wallet';
  onChange: (method: 'polar' | 'nowpayments' | 'wallet') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={() => onChange('polar')}
        className={`
          p-6 rounded-xl border-2 transition-all
          ${value === 'polar' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <CreditCard className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Card Payment</div>
        <div className="text-sm text-gray-600 mt-1">Powered by Polar</div>
      </button>

      <button
        type="button"
        onClick={() => onChange('nowpayments')}
        className={`
          p-6 rounded-xl border-2 transition-all relative
          ${value === 'nowpayments' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Discount</div>
        <Bitcoin className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Crypto</div>
        <div className="text-sm text-gray-600 mt-1">Pay with 300+ coins</div>
      </button>

      <button
        type="button"
        onClick={() => onChange('wallet')}
        className={`
          p-6 rounded-xl border-2 transition-all relative col-span-2
          ${value === 'wallet' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">Instant</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">💰</span>
        </div>
        <div className="font-semibold">Commission Wallet</div>
        <div className="text-sm text-gray-600 mt-1">Use your earnings to upgrade</div>
      </button>
    </div>
  );
}
