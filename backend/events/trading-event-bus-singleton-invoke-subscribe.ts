import { EventEmitter } from 'events';
import { TradingChannels } from './trading-event-channel-types';
import { Logger } from '../utils/logger';

const logger = new Logger('TradingEventBus');

type Handler<T> = (data: T) => Promise<unknown> | void;
type InvokeHandler<Req, Res> = (data: Req) => Promise<Res>;

export class TradingEventBus {
  private emitter = new EventEmitter();
  private invokeHandlers = new Map<string, InvokeHandler<unknown, unknown>>();
  private subscriberCounts = new Map<string, number>();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  // === Electron invoke/handle pattern (request-response) ===

  handle<K extends keyof TradingChannels>(
    channel: K,
    handler: TradingChannels[K] extends { request: infer Req; response: infer Res }
      ? InvokeHandler<Req, Res>
      : never
  ): void {
    this.invokeHandlers.set(channel as string, handler as InvokeHandler<unknown, unknown>);
    logger.info(`Handler registered: ${String(channel)}`);
  }

  async invoke<K extends keyof TradingChannels>(
    channel: K,
    data: TradingChannels[K] extends { request: infer Req } ? Req : never
  ): Promise<TradingChannels[K] extends { response: infer Res } ? Res : never> {
    const handler = this.invokeHandlers.get(channel as string);
    if (!handler) {
      throw new Error(`No handler for channel: ${String(channel)}`);
    }

    const start = Date.now();
    try {
      const result = await handler(data);
      logger.debug(`invoke ${String(channel)}: ${Date.now() - start}ms`);
      return result as TradingChannels[K] extends { response: infer Res } ? Res : never;
    } catch (error) {
      logger.error(`invoke ${String(channel)} failed`, error);
      throw error;
    }
  }

  // === Electron on/emit pattern (pub/sub) ===

  subscribe<K extends keyof TradingChannels>(
    channel: K,
    handler: Handler<TradingChannels[K] extends { request: unknown } ? never : TradingChannels[K]>
  ): () => void {
    this.emitter.on(channel as string, handler);
    const count = (this.subscriberCounts.get(channel as string) || 0) + 1;
    this.subscriberCounts.set(channel as string, count);

    // Return unsubscribe function
    return () => {
      this.emitter.off(channel as string, handler);
      const newCount = (this.subscriberCounts.get(channel as string) || 1) - 1;
      this.subscriberCounts.set(channel as string, newCount);
    };
  }

  emit<K extends keyof TradingChannels>(
    channel: K,
    data: TradingChannels[K] extends { request: unknown } ? never : TradingChannels[K]
  ): void {
    this.emitter.emit(channel as string, data);
  }

  // === Broadcast (send to all subscribers) ===

  broadcast<K extends keyof TradingChannels>(
    channel: K,
    data: TradingChannels[K] extends { request: unknown } ? never : TradingChannels[K]
  ): void {
    this.emitter.emit(channel as string, data);
    logger.debug(`broadcast ${String(channel)} → ${this.subscriberCounts.get(channel as string) || 0} subscribers`);
  }

  getStats(): { channels: string[]; subscriberCounts: Record<string, number>; handlerCount: number } {
    return {
      channels: Array.from(this.subscriberCounts.keys()),
      subscriberCounts: Object.fromEntries(this.subscriberCounts),
      handlerCount: this.invokeHandlers.size,
    };
  }
}

// Singleton instance
let _bus: TradingEventBus | null = null;

export function getTradingEventBus(): TradingEventBus {
  if (!_bus) {
    _bus = new TradingEventBus();
  }
  return _bus;
}
