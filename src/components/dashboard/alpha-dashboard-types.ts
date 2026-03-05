export type SignalType = 'BUY' | 'SELL' | 'WATCHING' | 'CONNECTING';

export interface Signal {
  id: string;
  symbol: string;
  type: SignalType;
  price: number;
  rsi: number;
  confidence: number;
  timestamp: number;
  status: 'active' | 'executed';
  plan?: TradePlan;
}

export interface TradePlan {
  direction: 'LONG' | 'SHORT';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  leverage: number;
  rr: number;
}

export interface ArbOpportunity {
  id: string;
  pair: string;
  buyExchange: string;
  sellExchange: string;
  spread: number;
  profit: number;
  timestamp: number;
}
