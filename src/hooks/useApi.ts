/**
 * API hooks for ApexOS
 * Connects frontend to backend APIs
 */

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
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
export function usePnL() {
    const [data, setData] = useState<PnLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`)
            .then(res => res.json())
            .then(setData)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return { data, loading, error };
}

export function useRebates() {
    const [data, setData] = useState<RebateData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/auditor/rebates?user_id=${USER_ID}`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}

export function useLeverage() {
    const [data, setData] = useState<LeverageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/guardian/leverage-check?user_id=${USER_ID}`)
            .then(res => res.json())
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    return { data, loading };
}

// Trade page hooks
export function usePortfolio() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`)
      .then(res => res.json())
      .then(pnl => {
        setData({
          totalValue: Math.abs(pnl.total_pnl) + 10000,
          pnl: pnl.total_pnl,
          pnlPercent: ((pnl.total_pnl / 10000) * 100).toFixed(2),
          winRate: pnl.win_rate,
          totalTrades: pnl.total_trades
        });
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
    Promise.all([
      fetch(`${API_BASE}/pnl/summary?user_id=${USER_ID}`).then(r => r.json()),
      fetch(`${API_BASE}/auditor/rebates?user_id=${USER_ID}`).then(r => r.json())
    ]).then(([pnl, rebate]) => {
      setMetrics({
        totalUsers: 1,
        totalTrades: pnl.total_trades,
        totalVolume: (pnl.total_trades * 2500).toFixed(0),
        totalFees: rebate.total_fees_paid,
        totalRebates: rebate.user_rebate,
        systemStatus: 'healthy'
      });
    }).finally(() => setLoading(false));
  }, []);

  return { metrics, loading };
}
