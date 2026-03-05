import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import { useWallet } from './useWallet';

export function usePresale() {
  const { user } = useAuth();
  const { available, refresh } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentRound, setCurrentRound] = useState<any>({
    id: 'round_1',
    name: 'Public Sale',
    price: 0.05,
    token_allocation: 10000000,
    tokens_sold: 4500000,
  });

  const buyTokens = async (amountUSDT: number) => {
    if (!user) return toast.error('Please login first');
    if (amountUSDT <= 0) return toast.error('Invalid amount');
    if (amountUSDT > available) return toast.error('Insufficient funds');

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/v1/launchpad/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountUSDT,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Purchase failed');

      setIsSuccess(true);
      toast.success(`Successfully purchased ${(amountUSDT / currentRound.price).toLocaleString()} APEX!`);
      refresh(); // Update wallet balance

      // Update local round data simulation
      setCurrentRound((prev: any) => ({
        ...prev,
        tokens_sold: prev.tokens_sold + amountUSDT / prev.price,
      }));
    } catch (e: any) {
      logger.error('Error occurred', e);
      setError(e.message);
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buyTokens,
    isLoading,
    isSuccess,
    error,
    currentRound,
  };
}
