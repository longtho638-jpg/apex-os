'use client';

/**
 * Parameterized subscription hook — accepts auth deps instead of importing AuthContext.
 */

import { useCallback, useEffect, useState } from 'react';
import type { RaaSBillingInfo, UseSubscriptionParams } from '../types/billing-types';

interface UseSubscriptionResult {
  data: RaaSBillingInfo | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSubscription({ userId, token, fetchBillingInfo }: UseSubscriptionParams): UseSubscriptionResult {
  const [data, setData] = useState<RaaSBillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const info = await fetchBillingInfo(userId, token);
      setData(info);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId, token, fetchBillingInfo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
