'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchReferralStats, type ReferralStats } from '@/lib/api/referral';

interface UseReferralResult {
  data: ReferralStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch referral statistics
 */
export function useReferral(): UseReferralResult {
  const { user, token } = useAuth();
  const [data, setData] = useState<ReferralStats | null>(null);
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
      const stats = await fetchReferralStats(user.id, token);
      setData(stats);
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
