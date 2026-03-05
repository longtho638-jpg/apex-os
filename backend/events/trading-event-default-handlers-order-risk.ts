import { TradingEventBus } from './trading-event-bus-singleton-invoke-subscribe';
import { Logger } from '../utils/logger';

const logger = new Logger('TradingEventHandlers');

// Register all default event handlers
export function registerTradingEventHandlers(bus: TradingEventBus): void {

  // Order execution handler (Electron main process pattern)
  bus.handle('orders:execute', async (request) => {
    logger.info(`Order request: ${request.side} ${request.quantity} ${request.symbol} @ ${request.price}`);

    // Validation (Electron preload filter pattern)
    if (!request.symbol || !request.quantity || request.quantity <= 0) {
      return { orderId: '', status: 'rejected' as const, reason: 'Invalid order parameters' };
    }

    if (!request.userId) {
      return { orderId: '', status: 'rejected' as const, reason: 'User ID required' };
    }

    // Generate order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    // Emit position update event
    bus.emit('positions:update', {
      userId: request.userId,
      symbol: request.symbol,
      side: request.side === 'BUY' ? 'long' : 'short',
      quantity: request.quantity,
      entryPrice: request.price,
      currentPrice: request.price,
      unrealizedPnl: 0,
      timestamp: Date.now(),
    });

    return { orderId, status: 'filled' as const, fillPrice: request.price };
  });

  // Risk check handler
  bus.handle('risk:check', async (request) => {
    const exposure = request.quantity * request.price;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (exposure > 100000) riskLevel = 'critical';
    else if (exposure > 50000) riskLevel = 'high';
    else if (exposure > 10000) riskLevel = 'medium';

    const approved = riskLevel !== 'critical';

    if (!approved) {
      bus.emit('risk:alert', {
        userId: request.userId,
        alertType: 'exposure_limit',
        severity: 'critical',
        message: `Order rejected: exposure $${exposure.toFixed(2)} exceeds limit`,
        timestamp: Date.now(),
      });
    }

    return { approved, riskLevel, reason: approved ? undefined : 'Exposure limit exceeded' };
  });

  logger.info('Trading event handlers registered');
}
