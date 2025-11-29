import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import { TradingService } from './trading';
import { Logger } from '../utils/logger';

const logger = new Logger('AutomationEngine');

interface AutomationRule {
    id: string;
    position_id: string;
    user_id: string;
    rule_type: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP';
    trigger_price: number;
    trailing_percent?: number;
    highest_price?: number;
    status: string;
}

interface Position {
    id: string;
    user_id: string;
    symbol: string;
    side: 'LONG' | 'SHORT';
    entry_price: number;
    quantity: number;
}

export class AutomationEngine {
    private supabase: SupabaseClient;
    private redis: Redis;
    private tradingService: TradingService;
    private isRunning = false;
    private rules: Map<string, AutomationRule[]> = new Map();

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
            // Load active automation rules
            const { data: rules, error } = await this.supabase
                .from('automation_rules')
                .select('*')
                .eq('status', 'ACTIVE');

            if (error) throw error;

            if (rules) {
                rules.forEach(rule => this.addRule(rule));
                logger.info(`Loaded ${rules.length} active automation rules`);
            }

            // Subscribe to price updates
            await this.subscribeToPrices();

            this.isRunning = true;
            logger.info('✅ Automation Engine initialized');
        } catch (error) {
            logger.error('Failed to initialize Automation Engine:', error);
            throw error;
        }
    }

    async setStopLoss(positionId: string, userId: string, stopPrice: number): Promise<string> {
        try {
            // Validate position exists
            const { data: position } = await this.supabase
                .from('positions')
                .select('*')
                .eq('id', positionId)
                .eq('user_id', userId)
                .eq('status', 'OPEN')
                .single();

            if (!position) {
                throw new Error('Position not found or already closed');
            }

            // Create stop loss rule
            const { data: rule, error } = await this.supabase
                .from('automation_rules')
                .insert({
                    position_id: positionId,
                    user_id: userId,
                    rule_type: 'STOP_LOSS',
                    trigger_price: stopPrice
                })
                .select()
                .single();

            if (error) throw error;

            this.addRule(rule);

            logger.info(`Stop Loss set: Position ${positionId} @ $${stopPrice}`);
            return rule.id;
        } catch (error) {
            logger.error('Failed to set stop loss:', error);
            throw error;
        }
    }

    async setTakeProfit(positionId: string, userId: string, targetPrice: number): Promise<string> {
        try {
            const { data: position } = await this.supabase
                .from('positions')
                .select('*')
                .eq('id', positionId)
                .eq('user_id', userId)
                .eq('status', 'OPEN')
                .single();

            if (!position) {
                throw new Error('Position not found or already closed');
            }

            const { data: rule, error } = await this.supabase
                .from('automation_rules')
                .insert({
                    position_id: positionId,
                    user_id: userId,
                    rule_type: 'TAKE_PROFIT',
                    trigger_price: targetPrice
                })
                .select()
                .single();

            if (error) throw error;

            this.addRule(rule);

            logger.info(`Take Profit set: Position ${positionId} @ $${targetPrice}`);
            return rule.id;
        } catch (error) {
            logger.error('Failed to set take profit:', error);
            throw error;
        }
    }

    async setTrailingStop(
        positionId: string,
        userId: string,
        trailingPercent: number,
        currentPrice: number
    ): Promise<string> {
        try {
            const { data: position } = await this.supabase
                .from('positions')
                .select('*')
                .eq('id', positionId)
                .eq('user_id', userId)
                .eq('status', 'OPEN')
                .single();

            if (!position) {
                throw new Error('Position not found or already closed');
            }

            // Calculate initial stop price based on trailing percentage
            const stopPrice = currentPrice * (1 - trailingPercent / 100);

            const { data: rule, error } = await this.supabase
                .from('automation_rules')
                .insert({
                    position_id: positionId,
                    user_id: userId,
                    rule_type: 'TRAILING_STOP',
                    trigger_price: stopPrice,
                    trailing_percent: trailingPercent,
                    highest_price: currentPrice
                })
                .select()
                .single();

            if (error) throw error;

            this.addRule(rule);

            logger.info(`Trailing Stop set: Position ${positionId}, ${trailingPercent}% trailing`);
            return rule.id;
        } catch (error) {
            logger.error('Failed to set trailing stop:', error);
            throw error;
        }
    }

    async cancelRule(ruleId: string, userId: string): Promise<void> {
        try {
            await this.supabase
                .from('automation_rules')
                .update({ status: 'CANCELLED' })
                .eq('id', ruleId)
                .eq('user_id', userId);

            this.removeRule(ruleId);

            logger.info(`Automation rule cancelled: ${ruleId}`);
        } catch (error) {
            logger.error('Failed to cancel rule:', error);
            throw error;
        }
    }

    async getPositionRules(positionId: string): Promise<AutomationRule[]> {
        const { data, error } = await this.supabase
            .from('automation_rules')
            .select('*')
            .eq('position_id', positionId)
            .eq('status', 'ACTIVE');

        if (error) {
            logger.error('Failed to get position rules:', error);
            return [];
        }

        return data || [];
    }

    private async subscribeToPrices() {
        const subscriber = this.redis.duplicate();
        await subscriber.subscribe('price_updates');

        subscriber.on('message', async (channel, message) => {
            if (channel === 'price_updates') {
                const priceUpdate = JSON.parse(message);
                await this.checkTriggers(priceUpdate.symbol, priceUpdate.price);
            }
        });

        logger.info('📡 Subscribed to price updates for automation triggers');
    }

    private async checkTriggers(symbol: string, currentPrice: number) {
        const symbolRules = this.rules.get(symbol) || [];

        for (const rule of symbolRules) {
            try {
                // Get position details
                const { data: position } = await this.supabase
                    .from('positions')
                    .select('*')
                    .eq('id', rule.position_id)
                    .single();

                if (!position || position.status !== 'OPEN') {
                    this.removeRule(rule.id);
                    continue;
                }

                let shouldTrigger = false;

                if (rule.rule_type === 'STOP_LOSS') {
                    // LONG: trigger if price <= stop price
                    // SHORT: trigger if price >= stop price
                    if (position.side === 'LONG' && currentPrice <= rule.trigger_price) {
                        shouldTrigger = true;
                    } else if (position.side === 'SHORT' && currentPrice >= rule.trigger_price) {
                        shouldTrigger = true;
                    }
                } else if (rule.rule_type === 'TAKE_PROFIT') {
                    // LONG: trigger if price >= target price
                    // SHORT: trigger if price <= target price
                    if (position.side === 'LONG' && currentPrice >= rule.trigger_price) {
                        shouldTrigger = true;
                    } else if (position.side === 'SHORT' && currentPrice <= rule.trigger_price) {
                        shouldTrigger = true;
                    }
                } else if (rule.rule_type === 'TRAILING_STOP') {
                    // Update highest price and trailing stop
                    const highestPrice = rule.highest_price || currentPrice;
                    if (currentPrice > highestPrice) {
                        // New high - update trailing stop
                        const newStopPrice = currentPrice * (1 - (rule.trailing_percent || 5) / 100);
                        await this.supabase
                            .from('automation_rules')
                            .update({
                                highest_price: currentPrice,
                                trigger_price: newStopPrice
                            })
                            .eq('id', rule.id);

                        rule.highest_price = currentPrice;
                        rule.trigger_price = newStopPrice;

                        logger.debug(`Trailing stop updated: ${rule.id} - New stop @ $${newStopPrice}`);
                    }

                    // Check if trailing stop triggered
                    if (currentPrice <= rule.trigger_price) {
                        shouldTrigger = true;
                    }
                }

                if (shouldTrigger) {
                    await this.triggerRule(rule, position, currentPrice);
                }
            } catch (error) {
                logger.error(`Error checking rule ${rule.id}:`, error);
            }
        }
    }

    private async triggerRule(rule: AutomationRule, position: Position, currentPrice: number) {
        try {
            logger.info(`🎯 Triggering ${rule.rule_type}: Position ${position.id} @ $${currentPrice}`);

            // Close position via TradingService
            await this.tradingService.closePosition(position.id, position.user_id);

            // Update rule status
            await this.supabase
                .from('automation_rules')
                .update({
                    status: 'TRIGGERED',
                    triggered_at: new Date().toISOString()
                })
                .eq('id', rule.id);

            this.removeRule(rule.id);

            logger.info(`✅ ${rule.rule_type} executed: Position ${position.id} closed @ $${currentPrice}`);
        } catch (error) {
            logger.error(`Failed to trigger rule ${rule.id}:`, error);
        }
    }

    private addRule(rule: AutomationRule) {
        // Get position symbol to organize rules
        this.supabase
            .from('positions')
            .select('symbol')
            .eq('id', rule.position_id)
            .single()
            .then(({ data }) => {
                if (data) {
                    const symbol = data.symbol;
                    if (!this.rules.has(symbol)) {
                        this.rules.set(symbol, []);
                    }
                    this.rules.get(symbol)!.push(rule);
                }
            });
    }

    private removeRule(ruleId: string) {
        this.rules.forEach((rules, symbol) => {
            const filtered = rules.filter(r => r.id !== ruleId);
            this.rules.set(symbol, filtered);
        });
    }

    stop() {
        this.isRunning = false;
        this.redis.quit();
        logger.info('⏹️  Automation Engine stopped');
    }
}

// Auto-start if run directly
if (require.main === module) {
    const engine = new AutomationEngine();
    engine.initialize();

    process.on('SIGINT', () => {
        engine.stop();
        process.exit(0);
    });
}
