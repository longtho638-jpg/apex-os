'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRebates, type RebateData } from '@/lib/api/rebates';

interface UseRebatesResult {
  data: RebateData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch rebate data with automatic polling
 */
export function useRebates(pollingInterval: number = 60000): UseRebatesResult {
  const { user, token } = useAuth();
  const [data, setData] = useState<RebateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const rebates = await fetchRebates(user.id, token);
      setData(rebates);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();

    // Poll for updates
    if (pollingInterval > 0) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval]);

  return { data, loading, error, refetch: fetchData };
}
