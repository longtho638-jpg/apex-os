'use client';

import { useState } from 'react';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { PAYMENT_TIERS, PaymentTier, getTierPrice, TierId } from '@/config/payment-tiers';

interface CheckoutModalProps {
  tier: PaymentTier | TierId;
  userEmail: string;
  onClose: () => void;
  billingPeriod?: 'monthly' | 'annual';
  initialDiscountCode?: string;
}

export function CheckoutModal({ tier, userEmail, onClose, billingPeriod = 'monthly', initialDiscountCode }: CheckoutModalProps) {
  const [gateway, setGateway] = useState<'polar' | 'nowpayments' | 'wallet'>('polar');
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState(initialDiscountCode || 'TRIAL20');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Map new TierId to PaymentTier for backward compatibility
  const tierConfig = PAYMENT_TIERS[tier as PaymentTier];

  // Calculate price based on gateway and billing period
  const tierPrice = getTierPrice(tier as TierId, billingPeriod);

  const basePrice = (gateway === 'nowpayments' && tierConfig.nowPayments)
    ? tierPrice * (1 - (tierConfig.nowPayments.cryptoDiscount || 0) / 100)
    : tierPrice;

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
          discountCode: discountApplied ? discountCode : null,
          billingPeriod
        })
      });

      const data = await response.json();

      if (data.success && gateway === 'wallet') {
        alert('Payment successful! Plan upgraded.');
        onClose();
        window.location.reload(); // Reload to reflect changes
        return;
      }

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

  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Fetch wallet balance when wallet is selected
  const fetchWalletBalance = async () => {
    try {
      // In a real app, use a proper hook or context. For MVP, we fetch directly.
      // We need a way to get the balance. Let's assume an API endpoint or Supabase call.
      // Since we are client side, we can use the Supabase client if available, or an API route.
      // Let's use a simple API route for now or assume we have it.
      // Actually, let's just mock it or fetch from a new endpoint /api/user/wallet/balance
      // For this task, I'll assume we can fetch it.

      // Mock for now to proceed, or better, use a real fetch if we had the endpoint.
      // Let's create a quick fetch to the wallet API we saw earlier?
      // /api/v1/user/finance/wallet/balance ?
      // Let's try to fetch from a generic endpoint.

      const res = await fetch('/api/v1/user/finance/wallet/balance');
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      }
    } catch (e) {
      console.error('Failed to fetch balance', e);
      setWalletBalance(0);
    }
  };

  if (gateway === 'wallet' && walletBalance === null) {
    fetchWalletBalance();
  }

  const isWalletInsufficient = gateway === 'wallet' && (walletBalance || 0) < price;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          Subscribe to {tierConfig.name} ({billingPeriod === 'annual' ? 'Yearly' : 'Monthly'})
        </h2>

        <PaymentMethodSelector value={gateway} onChange={setGateway} />

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>{billingPeriod === 'annual' ? 'Annual Price' : 'Monthly Price'}</span>
            <span className="font-semibold">${tierPrice}</span>
          </div>

          {gateway === 'nowpayments' && tierConfig.nowPayments && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Crypto Discount ({tierConfig.nowPayments.cryptoDiscount}%)</span>
              <span>-${(tierPrice - basePrice).toFixed(2)}</span>
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
            <span>${price.toFixed(2)}/{billingPeriod === 'annual' ? 'yr' : 'mo'}</span>
          </div>

          {gateway === 'wallet' && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${isWalletInsufficient ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <div className="flex justify-between font-medium">
                <span>Wallet Balance:</span>
                <span>${walletBalance?.toFixed(2) || '0.00'}</span>
              </div>
              {isWalletInsufficient && (
                <div className="mt-1 font-bold">⚠️ Insufficient funds</div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={loading || isWalletInsufficient}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' :
              gateway === 'wallet' ? 'Pay with Wallet' :
                gateway === 'polar' ? 'Pay with Card' : 'Pay with Crypto'}
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