"use client";

/**
 * Thin wrapper — injects AuthContext into vibe-payment parameterized hook.
 */
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription as useBillingSubscription } from '@apex-os/vibe-payment';
import { fetchBillingInfo } from '@/lib/api/billing';

export function useSubscription() {
  const { user, token } = useAuth();
  return useBillingSubscription({
    userId: user?.id,
    token: token ?? undefined,
    fetchBillingInfo,
  });
}
