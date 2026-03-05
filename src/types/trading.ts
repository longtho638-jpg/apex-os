export interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface Position {
  symbol: string;
  qty: number;
  avg: number;
  current: number;
  pnl: number;
  pnl_percent: number;
}

export interface APIKey {
  id: string;
  exchange: string;
  key: string;
  label: string;
  is_active: boolean;
  created_at: string;
}

export interface SystemStatus {
  market: string;
  connection: string;
  agents_active: number;
}

export interface Strategy {
  id: string;
  name: string;
  author: string;
  roi: number;
  winRate: number;
  followers: number;
}

export interface Whale {
  id: number;
  user: string;
  action: string;
  amount: string;
  time: string;
}

export interface Team {
  id: string;
  name: string;
  total_volume: number;
}

export interface PnLData {
  day: number;
  value: number;
  date?: string;
}
