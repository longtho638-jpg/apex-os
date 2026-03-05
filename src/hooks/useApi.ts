import { logger } from '@/lib/logger';
/**
 * API hooks for ApexOS
 * Connects frontend to backend APIs
 */

import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api/config';

const API_BASE = getApiUrl();
const USER_ID = '00000000-0000-0000-0000-000000000000'; // Demo user

// Types
export interface PnLData {
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  total_fees: number;
  win_rate: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  largest_win: number;
  largest_loss: number;
  profit_factor: number;
}

export interface RebateData {
  total_fees_paid: number;
  estimated_commission: number;
  user_rebate: number;
  apex_profit: number;
  rebate_percentage: number;
}

export interface LeverageData {
  is_over_leveraged: boolean;
  current_leverage: number;
  max_allowed_leverage: number;
  risk_profile: string;
  recommendation: string;
  status: string;
}

// Hooks
import { queryCache } from '@/lib/api-cache';

// Hooks
export function usePnL() {
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `pnl:summary:${USER_ID}`;
    const cached = queryCache.get<PnLData>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        queryCache.set(cacheKey, data);
        setData(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useRebates() {
  const [data, setData] = useState<RebateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `auditor:rebates:${USER_ID}`;
    const cached = queryCache.get<RebateData>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auditor/rebates?user_id=${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        queryCache.set(cacheKey, data);
        setData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useLeverage() {
  const [data, setData] = useState<LeverageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cacheKey = `guardian:leverage:${USER_ID}`;
    const cached = queryCache.get<LeverageData>(cacheKey);

    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/guardian/leverage-check?user_id=${USER_ID}`)
      .then((res) => res.json())
      .then((data) => {
        queryCache.set(cacheKey, data);
        setData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Trade page hooks
export function usePortfolio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reuse PnL cache if available
    const cacheKey = `pnl:summary:${USER_ID}`;
    const cached = queryCache.get<PnLData>(cacheKey);

    const processData = (pnl: any) => {
      setData({
        totalValue: Math.abs(pnl.total_pnl) + 10000,
        pnl: pnl.total_pnl,
        pnlPercent: ((pnl.total_pnl / 10000) * 100).toFixed(2),
        winRate: pnl.win_rate,
        totalTrades: pnl.total_trades,
      });
    };

    if (cached) {
      processData(cached);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`)
      .then((res) => res.json())
      .then((pnl) => {
        queryCache.set(cacheKey, pnl);
        processData(pnl);
      })
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

// Admin page metrics
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pnlKey = `pnl:summary:${USER_ID}`;
    const rebateKey = `auditor:rebates:${USER_ID}`;

    const cachedPnL = queryCache.get<PnLData>(pnlKey);
    const cachedRebate = queryCache.get<RebateData>(rebateKey);

    const fetchData = async () => {
      let pnl = cachedPnL;
      let rebate = cachedRebate;

      if (!pnl) {
        try {
          pnl = await fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`).then((r) => r.json());
          if (pnl) queryCache.set(pnlKey, pnl);
        } catch (e) {
          logger.error('Failed to fetch PnL', e);
        }
      }

      if (!rebate) {
        try {
          rebate = await fetch(`${API_BASE}/auditor/rebates?user_id=${USER_ID}`).then((r) => r.json());
          if (rebate) queryCache.set(rebateKey, rebate);
        } catch (e) {
          logger.error('Failed to fetch Rebates', e);
        }
      }

      if (pnl && rebate) {
        setMetrics({
          totalUsers: 1,
          totalTrades: pnl.total_trades,
          totalVolume: (pnl.total_trades * 2500).toFixed(0),
          totalFees: rebate.total_fees_paid,
          totalRebates: rebate.user_rebate,
          systemStatus: 'healthy',
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return { metrics, loading };
}

import { useAuth } from '@/contexts/AuthContext';

// Generic API hook
export function useApi() {
  const { token } = useAuth();

  const fetchApi = async (endpoint: string, options?: RequestInit) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
        logger.info(`[useApi] Sending request to ${endpoint} with token: ${token.substring(0, 10)}...`);
      } else {
        logger.warn(`[useApi] Sending request to ${endpoint} WITHOUT token`);
      }

      const response = await fetch(endpoint, {
        headers,
        ...options,
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          logger.error('[useApi] Request failed:', errorData);
          errorDetails = errorData.details || errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (_e) {
          logger.error('[useApi] Failed to parse error response');
        }
        throw new Error(`API error: ${response.status} - ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API error:', error);
      throw error;
    }
  };

  return { fetchApi };
}

// API client hook with method shortcuts
export function useApiClient() {
  const { token } = useAuth();

  const fetchApi = async (endpoint: string, options?: RequestInit) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      if (token) {
        (headers as any).Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
        ...options,
      });

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorData = await response.json();
          logger.error('[useApi] Request failed:', errorData);
          errorDetails = errorData.details || errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (_e) {
          logger.error('[useApi] Failed to parse error response');
        }
        throw new Error(`API error: ${response.status} - ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API error:', error);
      throw error;
    }
  };

  const api = {
    get: (endpoint: string) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint: string, data: any) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    put: (endpoint: string, data: any) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
  };

  return { api, fetchApi };
}
