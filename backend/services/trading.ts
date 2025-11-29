import Redis from 'ioredis';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ccxt from 'ccxt';
import * as dotenv from 'dotenv';
import path from 'path';
import { RiskCalculator } from './risk-calculator';
import { CONFIG } from '../config';



export class TradingService {
    private supabase!: SupabaseClient;
    private exchange!: ccxt.Exchange;
    private riskCalculator!: RiskCalculator;
    private redis!: Redis;

    private mode: 'PAPER' | 'LIVE' = 'PAPER';
    private exchangeClient: any = null; // CCXT client placeholder

    constructor() {
        this.initialize();
    }

    public setMode(mode: 'PAPER' | 'LIVE') {
        this.mode = mode;
        console.log(`[TradingService] Switched to ${mode} mode`);
    }

    private initialize() {
        if (!CONFIG.SUPABASE.URL || !CONFIG.SUPABASE.KEY) {
            throw new Error('Missing Supabase configuration');
        }
        if (!CONFIG.REDIS_URL) {
            throw new Error('Missing Redis configuration');
        }
        this.supabase = createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
        this.exchange = new ccxt.binance();
        this.riskCalculator = new RiskCalculator();
        this.redis = new Redis(CONFIG.REDIS_URL);
    }

    async placeOrder(userId: string, symbol: string, side: 'BUY' | 'SELL', quantity: number, price?: number, type: 'MARKET' | 'LIMIT' = 'MARKET') {
        // 1. Get User Balance & Current Positions for Risk Check
        const { data: wallet } = await this.supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', userId)
            .single();

        if (!wallet) {
            throw new Error(`Wallet not found for user ${userId}`);
        }

        const balance = Number(wallet.balance);

        const currentPositions = await this.getPositions(userId);

        // 2. Simulate Exchange Execution to get Price
        let exchangeOrderId = `PAPER_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let fillPrice = price;

        if (type === 'MARKET' && !fillPrice) {
            // Fetch current price for market order simulation
            const { data: market } = await this.supabase
                .from('market_data')
                .select('price')
                .eq('symbol', symbol)
                .single();
            fillPrice = market ? Number(market.price) : 0;
        }

        if (!fillPrice) throw new Error('Could not determine price for order');

        // 3. Perform Risk Check
        const newPosition = {
            symbol,
            side: side === 'BUY' ? 'LONG' : 'SHORT' as 'LONG' | 'SHORT',
            entry_price: fillPrice,
            quantity,
            leverage: 1 // Default leverage
        };

        const riskCheck = this.riskCalculator.canOpenPosition(newPosition, currentPositions, balance);

        if (!riskCheck.allowed) {
            throw new Error(`Risk Check Failed: ${riskCheck.reason}`);
        }

        // 4. Create Order Record
        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert({
                user_id: userId,
                symbol,
                type,
                side,
                quantity,
                price: fillPrice,
                status: 'FILLED',
                exchange_order_id: exchangeOrderId,
                filled_quantity: quantity,
                filled_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 5. Update/Create Position
        const position = await this.updatePosition(userId, symbol, side, quantity, fillPrice);

        // 6. Link Order to Position
        await this.supabase
            .from('orders')
            .update({ position_id: position.id })
            .eq('id', order.id);

        // 7. Publish Trade Event for Guardian Agent
        const tradeEvent = {
            type: 'TRADE_EXECUTED',
            userId,
            symbol,
            side,
            quantity,
            price: fillPrice,
            orderId: order.id,
            timestamp: Date.now()
        };

        // Fire and forget
        this.redis.publish('trade_events', JSON.stringify(tradeEvent)).catch(err => {
            console.error('Failed to publish trade event:', err);
        });

        return { order, position };
    }

    private async updatePosition(userId: string, symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number) {
        const positionSide = side === 'BUY' ? 'LONG' : 'SHORT';

        const { data: existingPosition } = await this.supabase
            .from('positions')
            .select('*')
            .eq('user_id', userId)
            .eq('symbol', symbol)
            .eq('status', 'OPEN')
            .single();

        if (existingPosition) {
            if (existingPosition.side === positionSide) {
                // Increase Position (Averaging)
                const oldQty = Number(existingPosition.quantity);
                const oldPrice = Number(existingPosition.entry_price);
                const newQty = oldQty + quantity;
                const newPrice = ((oldQty * oldPrice) + (quantity * price)) / newQty;

                const { data: updated, error } = await this.supabase
                    .from('positions')
                    .update({
                        quantity: newQty,
                        entry_price: newPrice,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingPosition.id)
                    .select()
                    .single();

                if (error) throw error;
                return updated;
            } else {
                // Reduce/Close Position (Hedging Mode - Create new opposite position for now)
                // For simplicity in this phase, we just open a new position
                return this.createPosition(userId, symbol, side, quantity, price);
            }
        } else {
            return this.createPosition(userId, symbol, side, quantity, price);
        }
    }

    private async createPosition(userId: string, symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number) {
        const positionSide = side === 'BUY' ? 'LONG' : 'SHORT';

        const { data: newPos, error } = await this.supabase
            .from('positions')
            .insert({
                user_id: userId,
                symbol,
                side: positionSide,
                entry_price: price,
                quantity,
                leverage: 1,
                status: 'OPEN',
                current_price: price
            })
            .select()
            .single();

        if (error) throw error;
        return newPos;
    }

    async getPositions(userId: string) {
        const { data: positions, error } = await this.supabase
            .from('positions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'OPEN')
            .order('opened_at', { ascending: false });

        if (error) throw error;

        if (positions.length === 0) return [];

        // Batch fetch market data
        const symbols = [...new Set(positions.map(p => p.symbol))];
        const { data: markets } = await this.supabase
            .from('market_data')
            .select('symbol, price')
            .in('symbol', symbols);

        const marketMap = new Map(markets?.map(m => [m.symbol, Number(m.price)]) || []);

        // Calculate PnL
        return positions.map((pos) => {
            const currentPrice = marketMap.get(pos.symbol);

            if (currentPrice !== undefined) {
                const entryPrice = Number(pos.entry_price);
                const qty = Number(pos.quantity);
                const diff = pos.side === 'LONG' ? currentPrice - entryPrice : entryPrice - currentPrice;
                const pnl = diff * qty * (pos.leverage || 1);

                return { ...pos, current_price: currentPrice, unrealized_pnl: pnl };
            }
            return pos;
        });
    }

    async closePosition(userId: string, positionId: string) {
        const { data: position } = await this.supabase
            .from('positions')
            .select('*')
            .eq('id', positionId)
            .eq('user_id', userId)
            .single();

        if (!position || position.status !== 'OPEN') throw new Error('Position not found or already closed');

        const { data: market } = await this.supabase
            .from('market_data')
            .select('price')
            .eq('symbol', position.symbol)
            .single();

        const closePrice = market ? Number(market.price) : Number(position.current_price);

        // Calculate Final PnL
        const diff = position.side === 'LONG' ? closePrice - Number(position.entry_price) : Number(position.entry_price) - closePrice;
        const realizedPnL = diff * Number(position.quantity) * (position.leverage || 1);

        // Close Position
        const { data: closed, error } = await this.supabase
            .from('positions')
            .update({
                status: 'CLOSED',
                closed_at: new Date().toISOString(),
                current_price: closePrice,
                unrealized_pnl: 0
            })
            .eq('id', positionId)
            .select()
            .single();

        if (error) throw error;

        // Create Closing Order
        await this.supabase.from('orders').insert({
            user_id: userId,
            position_id: positionId,
            symbol: position.symbol,
            type: 'MARKET',
            side: position.side === 'LONG' ? 'SELL' : 'BUY',
            quantity: position.quantity,
            price: closePrice,
            status: 'FILLED',
            filled_quantity: position.quantity,
            filled_at: new Date().toISOString(),
            exchange_order_id: `PAPER_CLOSE_${Date.now()}`
        });

        return { position: closed, realizedPnL };
    }
}
