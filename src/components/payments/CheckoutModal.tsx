'use client';

import { useState } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PAYMENT_TIERS, PaymentTier } from '@/config/payment-tiers';
import { X, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface CheckoutModalProps {
  tier: PaymentTier;
  userEmail: string;
  onClose: () => void;
  isOpen: boolean;
}

export function CheckoutModal({ tier, userEmail, onClose, isOpen }: CheckoutModalProps) {
  const [gateway, setGateway] = useState<'polar' | 'binance_pay'>('polar');
  const [loading, setLoading] = useState(false);
  
  const tierConfig = PAYMENT_TIERS[tier];
  
  // Calculate dynamic pricing
  const originalPrice = tierConfig.price;
  const isCrypto = gateway === 'binance_pay' && tierConfig.binancePay;
  const discountPercent = isCrypto ? tierConfig.binancePay!.cryptoDiscount : 0;
  const finalPrice = isCrypto 
    ? originalPrice * (1 - discountPercent / 100) 
    : originalPrice;
  const discountAmount = originalPrice - finalPrice;

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, gateway, userEmail })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate checkout');
      }
      
      if (data.checkoutUrl) {
        // Redirect to payment gateway
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Checkout Failed', {
        description: error.message || 'Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
    >
      <div 
        className="bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 id="checkout-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Subscribe to {tierConfig.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Payment Method Selection */}
          <PaymentMethodSelector value={gateway} onChange={setGateway} />
          
          {/* Order Summary */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 mb-6 border border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 mb-3 uppercase tracking-wider">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Monthly Subscription</span>
                <span>${originalPrice.toFixed(2)}</span>
              </div>
              
              {isCrypto && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-medium">
                  <span>Crypto Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3 flex justify-between items-baseline">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Total Due</span>
                <div className="text-right">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        ${finalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500 block">/month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure encrypted checkout via {gateway === 'polar' ? 'Polar.sh' : 'Binance Pay'}</span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`
                w-full py-3.5 rounded-xl font-semibold text-white shadow-lg
                flex items-center justify-center gap-2 transition-all
                ${loading 
                    ? 'bg-zinc-400 cursor-not-allowed' 
                    : gateway === 'polar' 
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                        : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}
              `}
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading 
                ? 'Processing...' 
                : `Pay $${finalPrice.toFixed(2)} ${gateway === 'polar' ? 'with Card' : 'with Crypto'}`
              }
            </button>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
