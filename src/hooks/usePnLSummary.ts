'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchPnLSummary, type PnLPeriod, type PnLSummary } from '@/lib/api/pnl';

interface UsePnLSummaryResult {
  data: PnLSummary | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch PnL summary data with automatic refetching
 */
export function usePnLSummary(period: PnLPeriod = '30d'): UsePnLSummaryResult {
  const { user, token } = useAuth();
  const [data, setData] = useState<PnLSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const summary = await fetchPnLSummary(user.id, period, token);
      setData(summary);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
