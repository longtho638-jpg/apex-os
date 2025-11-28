'use client';

import { useState } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';

interface CheckoutModalProps {
  tier: PaymentTier;
  userEmail: string;
  onClose: () => void;
}

export function CheckoutModal({ tier, userEmail, onClose }: CheckoutModalProps) {
  const [gateway, setGateway] = useState<'polar' | 'nowpayments'>('polar');
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('TRIAL20');
  const [discountApplied, setDiscountApplied] = useState(false);
  
  const tierConfig = PAYMENT_TIERS[tier];
  
  // Calculate price based on gateway
  const basePrice = (gateway === 'nowpayments' && tierConfig.nowPayments)
    ? tierConfig.nowPayments.price_amount * (1 - (tierConfig.nowPayments.cryptoDiscount || 0) / 100)
    : tierConfig.price;

  const discountMultiplier = discountApplied ? 0.8 : 1; // 20% off if applied
  const price = basePrice * discountMultiplier;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tier, 
          gateway, 
          userEmail,
          discountCode: discountApplied ? discountCode : null
        })
      });
      
      const data = await response.json();
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          Subscribe to {tierConfig.name}
        </h2>
        
        <PaymentMethodSelector value={gateway} onChange={setGateway} />
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>Monthly Price</span>
            <span className="font-semibold">${tierConfig.price}</span>
          </div>
          
          {gateway === 'nowpayments' && tierConfig.nowPayments && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Crypto Discount ({tierConfig.nowPayments.cryptoDiscount}%)</span>
              <span>-${(tierConfig.price - basePrice).toFixed(2)}</span>
            </div>
          )}

          {/* Discount Code Input */}
          <div className="mb-4 pt-2 border-t">
            <label className="block text-sm font-medium mb-2">Discount Code (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setDiscountApplied(false);
                }}
                placeholder="TRIAL20"
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-400 text-black"
              />
              <button 
                onClick={() => setDiscountApplied(discountCode === 'TRIAL20')}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium"
                type="button"
              >
                Apply
              </button>
            </div>
            {discountApplied && (
              <p className="text-emerald-600 text-sm mt-1 font-medium">✅ 20% discount applied!</p>
            )}
          </div>
          
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${price.toFixed(2)}/mo</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Pay ${gateway === 'polar' ? 'with Card' : 'with Crypto'}`}
          </button>
          
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}