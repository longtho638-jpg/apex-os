'use client';

import { CreditCard, Bitcoin } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'polar' | 'binance_pay';
  onChange: (method: 'polar' | 'binance_pay') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" role="radiogroup" aria-label="Select Payment Method">
      {/* Polar / Credit Card Option */}
      <button
        type="button"
        onClick={() => onChange('polar')}
        className={`
          relative p-6 rounded-xl border-2 transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center text-center
          hover:shadow-md hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${value === 'polar' 
            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-sm' 
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
        `}
        role="radio"
        aria-checked={value === 'polar'}
        id="payment-method-polar"
      >
        <div className={`p-3 rounded-full mb-3 ${value === 'polar' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-500'}`}>
          <CreditCard className="w-6 h-6" />
        </div>
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">Card / PayPal</div>
        <div className="text-xs text-zinc-500 mt-1">
          Secure checkout via Polar
        </div>
        {value === 'polar' && (
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-600" />
        )}
      </button>

      {/* Binance Pay / Crypto Option */}
      <button
        type="button"
        onClick={() => onChange('binance_pay')}
        className={`
          relative p-6 rounded-xl border-2 transition-all duration-200 ease-in-out
          flex flex-col items-center justify-center text-center overflow-hidden
          hover:shadow-md hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2
          ${value === 'binance_pay' 
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20 shadow-sm' 
            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'}
        `}
        role="radio"
        aria-checked={value === 'binance_pay'}
        id="payment-method-binance"
      >
        {/* Discount Badge */}
        <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow-sm">
          SAVE 15%
        </div>

        <div className={`p-3 rounded-full mb-3 ${value === 'binance_pay' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'}`}>
          <Bitcoin className="w-6 h-6" />
        </div>
        <div className="font-semibold text-zinc-900 dark:text-zinc-100">Crypto</div>
        <div className="text-xs text-zinc-500 mt-1">
          USDT, BTC, ETH, BNB
        </div>
        {value === 'binance_pay' && (
          <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-amber-500" />
        )}
      </button>
    </div>
  );
}
