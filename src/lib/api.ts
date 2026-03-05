import { logger } from '@/lib/logger';

const API_URL = 'http://localhost:8000/api/v1';

export async function fetchWatchlist() {
  try {
    const res = await fetch(`${API_URL}/dashboard/watchlist`);
    if (!res.ok) throw new Error('Failed to fetch watchlist');
    return await res.json();
  } catch (error) {
    logger.error('Operation failed', error);
    return [];
  }
}

export async function fetchPositions() {
  try {
    const res = await fetch(`${API_URL}/dashboard/positions`);
    if (!res.ok) throw new Error('Failed to fetch positions');
    return await res.json();
  } catch (error) {
    logger.error('Operation failed', error);
    return [];
  }
}

export async function fetchSystemStatus() {
  try {
    const res = await fetch(`${API_URL}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (error) {
    logger.error('Operation failed', error);
    return { market: 'OFFLINE', connection: 'ERROR', agents_active: 0 };
  }
}

export async function fetchMarketConditions(symbol: string) {
  try {
    // Mock data for now if backend endpoint doesn't exist
    return {
      symbol,
      price: 45000 + Math.random() * 100,
      spread: 0.5,
      spread_percent: '0.01%',
      volatility_percent: '1.2%',
    };
  } catch (error) {
    logger.error('fetchMarketConditions error', error);
    return null;
  }
}

export async function fetchTradeHistory(_userId: string, _symbol: string) {
  try {
    // Mock data
    return {
      trades: [
        { price: 45100, quantity: 0.5, timestamp: Date.now() - 10000, side: 'buy' },
        { price: 45150, quantity: 0.2, timestamp: Date.now() - 50000, side: 'sell' },
      ],
    };
  } catch (error) {
    logger.error('fetchTradeHistory error', error);
    return { trades: [] };
  }
}

export async function triggerSync(_userId: string, _exchange: string, _key: string, _secret: string) {
  try {
    // Mock sync
    return { success: true };
  } catch (error) {
    logger.error('triggerSync error', error);
    throw error;
  }
}
