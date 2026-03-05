'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  type FundingRates,
  fetchFundingRates,
  fetchLeverageCheck,
  fetchLiquidationRisk,
  type LeverageCheck,
  type LiquidationRisk,
} from '@/lib/api/risk';

interface UseRiskMetricsResult {
  liquidationData: LiquidationRisk | null;
  leverageData: LeverageCheck | null;
  fundingData: FundingRates | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch all risk metrics from Guardian agent
 */
export function useRiskMetrics(): UseRiskMetricsResult {
  const { user, token } = useAuth();
  const [liquidationData, setLiquidationData] = useState<LiquidationRisk | null>(null);
  const [leverageData, setLeverageData] = useState<LeverageCheck | null>(null);
  const [fundingData, setFundingData] = useState<FundingRates | null>(null);
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

      // Fetch all risk metrics in parallel
      const [liq, lev, fund] = await Promise.all([
        fetchLiquidationRisk(user.id, token),
        fetchLeverageCheck(user.id, token),
        fetchFundingRates(user.id, token),
      ]);

      setLiquidationData(liq);
      setLeverageData(lev);
      setFundingData(fund);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { liquidationData, leverageData, fundingData, loading, error, refetch: fetchData };
}
