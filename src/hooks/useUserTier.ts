"use client";

/**
 * Thin wrapper — injects AuthContext + apiBaseUrl into vibe-payment parameterized hook.
 */
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api/config';
import { useUserTier as useBillingUserTier } from '@apex-os/vibe-payment';

export type { MenuId } from '@apex-os/vibe-payment';

export function useUserTier() {
  const { user, isAuthenticated, token } = useAuth();
  return useBillingUserTier({
    isAuthenticated,
    userId: user?.id,
    token: token ?? undefined,
    apiBaseUrl: getApiUrl(),
  });
}
