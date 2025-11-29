import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import { TradingService } from './trading';
import { Logger } from '../utils/logger';

const logger = new Logger('OrderManager');

interface LimitOrder {
    id: string;
    userId: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    timeInForce: 'GTC' | 'IOC' | 'FOK';
    expiresAt?: Date;
}

interface OrderBookEntry {
    id: string;
    order_id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    filled_quantity: number;
    remaining_quantity: number;
    user_id: string;
    status: string;
}

export class OrderManager {
    private supabase: SupabaseClient;
    private redis: Redis;
    private tradingService: TradingService;
    private orderBook: Map<string, OrderBookEntry[]> = new Map();
    private isRunning = false;

    constructor() {
        if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
            throw new Error('Missing Supabase configuration');
        }
        if (!CONFIG.REDIS_URL) {
            throw new Error('Missing Redis configuration');
        }

        this.supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
        this.redis = new Redis(CONFIG.REDIS_URL);
        this.tradingService = new TradingService();
    }

    async initialize() {
        try {
            // Load existing open limit orders from database
            const { data: orders, error } = await this.supabase
                .from('order_book')
                .select('*')
                .eq('status', 'OPEN');

            if (error) throw error;

            if (orders) {
                orders.forEach(order => this.addToOrderBook(order));
                logger.info(`Loaded ${orders.length} open limit orders`);
            }

            // Subscribe to price updates for order matching
            await this.subscribeToPrices();

            this.isRunning = true;
            logger.info('✅ Order Manager initialized');
        } catch (error) {
            logger.error('Failed to initialize Order Manager:', error);
            throw error;
        }
    }

    async placeLimitOrder(order: LimitOrder): Promise<string> {
        try {
            // 1. Validate order parameters
            if (order.price <= 0) {
                throw new Error('Price must be greater than 0');
            }
            if (order.quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            // 2. Create order record in orders table
            const { data: orderRecord, error: orderError } = await this.supabase
                .from('orders')
                .insert({
                    user_id: order.userId,
                    symbol: order.symbol,
                    type: 'LIMIT',
                    side: order.side,
                    quantity: order.quantity,
                    limit_price: order.price,
                    status: 'PENDING',
                    time_in_force: order.timeInForce,
                    expires_at: order.expiresAt
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Add to order book
            const { data: bookEntry, error: bookError } = await this.supabase
                .from('order_book')
                .insert({
                    order_id: orderRecord.id,
                    symbol: order.symbol,
                    side: order.side,
                    price: order.price,
                    quantity: order.quantity,
                    user_id: order.userId,
                    status: 'OPEN'
                })
                .select()
                .single();

            if (bookError) throw bookError;

            // 4. Add to in-memory order book for fast matching
            this.addToOrderBook(bookEntry);

            logger.info(`Limit order placed: ${orderRecord.id} - ${order.side} ${order.quantity} ${order.symbol} @ $${order.price}`);

            return orderRecord.id;
        } catch (error) {
            logger.error('Failed to place limit order:', error);
            throw error;
        }
    }

    async cancelLimitOrder(orderId: string, userId: string): Promise<void> {
        try {
            // 1. Update order book status
            const { error: bookError } = await this.supabase
                .from('order_book')
                .update({ status: 'CANCELLED' })
                .eq('order_id', orderId)
                .eq('user_id', userId);

            if (bookError) throw bookError;

            // 2. Update order status
            const { error: orderError } = await this.supabase
                .from('orders')
                .update({ status: 'CANCELLED' })
                .eq('id', orderId);

            if (orderError) throw orderError;

            // 3. Remove from in-memory order book
            this.removeFromOrderBook(orderId);

            logger.info(`Limit order cancelled: ${orderId}`);
        } catch (error) {
            logger.error('Failed to cancel limit order:', error);
            throw error;
        }
    }

    async getUserOrders(userId: string, status?: string): Promise<OrderBookEntry[]> {
        try {
            let query = this.supabase
                .from('order_book')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            logger.error('Failed to get user orders:', error);
            return [];
        }
    }

    private async subscribeToPrices() {
        const subscriber = this.redis.duplicate();
        await subscriber.subscribe('price_updates');

        subscriber.on('message', async (channel, message) => {
            if (channel === 'price_updates') {
                const priceUpdate = JSON.parse(message);
                await this.checkMatches(priceUpdate.symbol, priceUpdate.price);
            }
        });

        logger.info('📡 Subscribed to price updates for order matching');
    }

    private async checkMatches(symbol: string, currentPrice: number) {
        const orders = this.orderBook.get(symbol) || [];

        for (const order of orders) {
            let shouldExecute = false;

            // Buy orders: execute when market price <= limit price
            if (order.side === 'BUY' && currentPrice <= order.price) {
                shouldExecute = true;
            }
            // Sell orders: execute when market price >= limit price
            else if (order.side === 'SELL' && currentPrice >= order.price) {
                shouldExecute = true;
            }

            if (shouldExecute) {
                await this.executeOrder(order, currentPrice);
            }
        }
    }

    private async executeOrder(order: OrderBookEntry, executionPrice: number) {
        try {
            logger.info(`Executing limit order: ${order.order_id} @ $${executionPrice}`);

            // Execute trade via TradingService
            await this.tradingService.placeOrder(
                order.user_id,
                order.symbol,
                order.side,
                order.remaining_quantity,
                executionPrice,
                'MARKET'
            );

            // Update order book entry
            await this.supabase
                .from('order_book')
                .update({
                    status: 'FILLED',
                    filled_quantity: order.quantity
                })
                .eq('id', order.id);

            // Update main order record
            await this.supabase
                .from('orders')
                .update({
                    status: 'FILLED',
                    filled_quantity: order.quantity,
                    price: executionPrice,
                    filled_at: new Date().toISOString()
                })
                .eq('id', order.order_id);

            // Remove from in-memory order book
            this.removeFromOrderBook(order.order_id);

            logger.info(`✅ Limit order executed: ${order.order_id} @ $${executionPrice}`);
        } catch (error) {
            logger.error(`❌ Failed to execute order ${order.order_id}:`, error);
        }
    }

    private addToOrderBook(order: OrderBookEntry) {
        const symbol = order.symbol;
        if (!this.orderBook.has(symbol)) {
            this.orderBook.set(symbol, []);
        }
        this.orderBook.get(symbol)!.push(order);

        // Sort by price (best prices first)
        const orders = this.orderBook.get(symbol)!;
        orders.sort((a, b) => {
            if (a.side === 'BUY') {
                return b.price - a.price; // Highest buy prices first
            } else {
                return a.price - b.price; // Lowest sell prices first
            }
        });
    }

    private removeFromOrderBook(orderId: string) {
        this.orderBook.forEach((orders, symbol) => {
            const filtered = orders.filter(o => o.order_id !== orderId);
            this.orderBook.set(symbol, filtered);
        });
    }

    stop() {
        this.isRunning = false;
        this.redis.quit();
        logger.info('⏹️  Order Manager stopped');
    }
}

// Auto-start if run directly
if (require.main === module) {
    const manager = new OrderManager();
    manager.initialize();

    process.on('SIGINT', () => {
        manager.stop();
        process.exit(0);
    });
}
