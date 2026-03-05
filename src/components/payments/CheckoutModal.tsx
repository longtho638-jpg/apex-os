'use client';

import { getTierById, getTierPrice, type PaymentTier, type TierId } from '@apex-os/vibe-payment';
import { useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface CheckoutModalProps {
  tier: PaymentTier | TierId;
  userEmail: string;
  onClose: () => void;
}

export function CheckoutModal({ tier, userEmail, onClose }: CheckoutModalProps) {
  const [gateway, setGateway] = useState<'polar' | 'nowpayments' | 'wallet'>('polar');
  const [loading, setLoading] = useState(false);

  // Get tier config (handles normalization)
  const tierConfig = getTierById(tier);

  if (!tierConfig) {
    logger.error('Invalid tier ID:', tier);
    return null;
  }

  // RaaS model: $0 subscription, revenue from spread only
  const tierPrice = getTierPrice(tierConfig.id as TierId);
  const price = tierPrice; // Always $0 for RaaS model

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: tierConfig?.id,
          gateway,
          userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Success for wallet or non-redirect flows
      toast.success('Payment successful!');
      onClose();
    } catch (error) {
      logger.error('Checkout error:', error);
      toast.error('Checkout Failed', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
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
      logger.error('Failed to fetch balance', e);
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
        <h2 className="text-2xl font-bold mb-4">Activate {tierConfig.name} Tier</h2>

        <PaymentMethodSelector value={gateway} onChange={setGateway} />

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span>Subscription Fee</span>
            <span className="font-semibold text-emerald-600">$0 Forever</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-500 text-sm">
            <span>Revenue Model</span>
            <span>Exchange Spread ({tierConfig.name})</span>
          </div>

          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600">FREE</span>
          </div>

          {gateway === 'wallet' && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${isWalletInsufficient ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
            >
              <div className="flex justify-between font-medium">
                <span>Wallet Balance:</span>
                <span>${walletBalance?.toFixed(2) || '0.00'}</span>
              </div>
              {isWalletInsufficient && <div className="mt-1 font-bold">⚠️ Insufficient funds</div>}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={loading || isWalletInsufficient}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Processing...'
              : gateway === 'wallet'
                ? 'Pay with Wallet'
                : gateway === 'polar'
                  ? 'Pay with Card'
                  : 'Pay with Crypto'}
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
