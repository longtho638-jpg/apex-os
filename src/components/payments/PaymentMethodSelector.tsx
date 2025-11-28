'use client';

import { CreditCard, Bitcoin } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: 'polar' | 'nowpayments';
  onChange: (method: 'polar' | 'nowpayments') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={() => onChange('polar')}
        className={`
          p-6 rounded-xl border-2 transition-all
          ${value === 'polar' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <CreditCard className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Card / PayPal</div>
        <div className="text-sm text-gray-600 mt-1">
          Powered by Polar
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('nowpayments')}
        className={`
          p-6 rounded-xl border-2 transition-all relative
          ${value === 'nowpayments' 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300'}
        `}
      >
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Discount
        </div>
        <Bitcoin className="w-8 h-8 mb-2 mx-auto" />
        <div className="font-semibold">Crypto</div>
        <div className="text-sm text-gray-600 mt-1">
          Pay with 300+ coins
        </div>
      </button>
    </div>
  );
}