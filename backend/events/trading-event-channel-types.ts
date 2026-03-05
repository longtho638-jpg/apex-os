// Electron-inspired typed channels for trading services
// Pattern: invoke/handle (request-response) + pub/sub (streams)

export type ChannelType = 'invoke' | 'subscribe' | 'broadcast';

// === Request-Response Channels (Electron invoke/handle) ===
export interface OrderExecuteRequest {
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  type: 'MARKET' | 'LIMIT' | 'STOP';
}

export interface OrderExecuteResponse {
  orderId: string;
  status: 'filled' | 'pending' | 'rejected';
  fillPrice?: number;
  reason?: string;
}

export interface RiskCheckRequest {
  userId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export interface RiskCheckResponse {
  approved: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reason?: string;
  maxAllowedQuantity?: number;
}

// === Pub/Sub Channels (Electron on/emit) ===
export interface PriceUpdateEvent {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  volume24h: number;
  timestamp: number;
}

export interface PositionUpdateEvent {
  userId: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  timestamp: number;
}

export interface AgentMemoryEvent {
  agentId: string;
  action: 'add' | 'search' | 'consolidate';
  category: string;
  content: string;
  timestamp: number;
}

export interface RiskAlertEvent {
  userId: string;
  alertType: 'margin_call' | 'stop_loss' | 'exposure_limit' | 'drawdown';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
}

// Channel registry
export interface TradingChannels {
  // invoke/handle (request-response)
  'orders:execute': { request: OrderExecuteRequest; response: OrderExecuteResponse };
  'risk:check': { request: RiskCheckRequest; response: RiskCheckResponse };

  // pub/sub (streams)
  'prices:update': PriceUpdateEvent;
  'positions:update': PositionUpdateEvent;
  'agents:memory': AgentMemoryEvent;
  'risk:alert': RiskAlertEvent;
}
