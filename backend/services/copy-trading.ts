import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { CONFIG } from '../config';
import { TradingService } from './trading';
import { Logger } from '../utils/logger';

const logger = new Logger('CopyTradingService');

export class CopyTradingService {
    private supabase: SupabaseClient;
    private redis: Redis;
    private tradingService: TradingService;

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
        // Subscribe to trade events
        await this.subscribeToTrades();
        logger.info('✅ Copy Trading Service initialized');
    }

    async registerAsLeader(userId: string, displayName: string, description?: string): Promise<string> {
        try {
            const { data, error } = await this.supabase
                .from('copy_trading_leaders')
                .upsert({
                    user_id: userId,
                    display_name: displayName,
                    description: description || '',
                    is_accepting_followers: true
                })
                .select()
                .single();

            if (error) throw error;

            logger.info(`Leader registered: ${userId} - ${displayName}`);
            return data.id;
        } catch (error) {
            logger.error('Failed to register leader:', error);
            throw error;
        }
    }

    async followLeader(followerId: string, leaderId: string, copyRatio: number = 1.0, maxAmount?: number): Promise<void> {
        try {
            // Validate leader exists
            const { data: leader } = await this.supabase
                .from('copy_trading_leaders')
                .select('*')
                .eq('id', leaderId)
                .single();

            if (!leader || !leader.is_accepting_followers) {
                throw new Error('Leader not found or not accepting followers');
            }

            // Create follower relationship
            const { error } = await this.supabase
                .from('copy_trading_followers')
                .insert({
                    leader_id: leaderId,
                    follower_id: followerId,
                    copy_ratio: copyRatio,
                    max_copy_amount: maxAmount,
                    is_active: true
                });

            if (error) throw error;

            // Update leader follower count
            await this.supabase
                .from('copy_trading_leaders')
                .update({ total_followers: leader.total_followers + 1 })
                .eq('id', leaderId);

            logger.info(`User ${followerId} now following ${leaderId} with ratio ${copyRatio}`);
        } catch (error) {
            logger.error('Failed to follow leader:', error);
            throw error;
        }
    }

    async unfollowLeader(followerId: string, leaderId: string): Promise<void> {
        try {
            await this.supabase
                .from('copy_trading_followers')
                .update({ is_active: false })
                .eq('leader_id', leaderId)
                .eq('follower_id', followerId);

            // Update leader follower count
            const { data: leader } = await this.supabase
                .from('copy_trading_leaders')
                .select('total_followers')
                .eq('id', leaderId)
                .single();

            if (leader) {
                await this.supabase
                    .from('copy_trading_leaders')
                    .update({ total_followers: Math.max(0, leader.total_followers - 1) })
                    .eq('id', leaderId);
            }

            logger.info(`User ${followerId} unfollowed ${leaderId}`);
        } catch (error) {
            logger.error('Failed to unfollow leader:', error);
            throw error;
        }
    }

    async getLeaders(limit: number = 20) {
        const { data, error } = await this.supabase
            .from('copy_trading_leaderboard')
            .select('*')
            .limit(limit);

        if (error) {
            logger.error('Failed to get leaders:', error);
            return [];
        }

        return data || [];
    }

    async getUserFollowing(userId: string) {
        const { data, error } = await this.supabase
            .from('copy_trading_followers')
            .select('*, copy_trading_leaders(*)')
            .eq('follower_id', userId)
            .eq('is_active', true);

        if (error) {
            logger.error('Failed to get following:', error);
            return [];
        }

        return data || [];
    }

    private async subscribeToTrades() {
        const subscriber = this.redis.duplicate();
        await subscriber.subscribe('trade_events');

        subscriber.on('message', async (channel, message) => {
            if (channel === 'trade_events') {
                const event = JSON.parse(message);
                if (event.type === 'ORDER_FILLED') {
                    await this.replicateTrade(event.data);
                }
            }
        });

        logger.info('📡 Subscribed to trade events for copy trading');
    }

    private async replicateTrade(trade: any) {
        try {
            // Check if user is a leader
            const { data: leader } = await this.supabase
                .from('copy_trading_leaders')
                .select('id')
                .eq('user_id', trade.user_id)
                .single();

            if (!leader) return;

            // Get active followers
            const { data: followers } = await this.supabase
                .from('copy_trading_followers')
                .select('*')
                .eq('leader_id', leader.id)
                .eq('is_active', true);

            if (!followers || followers.length === 0) return;

            logger.info(`Replicating trade from leader ${leader.id} to ${followers.length} followers`);

            // Replicate to each follower
            for (const follower of followers) {
                try {
                    const adjustedQty = trade.quantity * follower.copy_ratio;
                    const estimatedCost = adjustedQty * trade.price;

                    // Check max copy amount
                    if (follower.max_copy_amount && estimatedCost > follower.max_copy_amount) {
                        logger.debug(`Skipping copy for ${follower.follower_id}: exceeds max amount`);
                        continue;
                    }

                    // Execute copy trade
                    await this.tradingService.placeOrder(
                        follower.follower_id,
                        trade.symbol,
                        trade.side,
                        adjustedQty,
                        undefined,
                        'MARKET'
                    );

                    logger.info(`✅ Trade copied to ${follower.follower_id}: ${trade.side} ${adjustedQty} ${trade.symbol}`);
                } catch (error) {
                    logger.error(`Failed to copy trade to ${follower.follower_id}:`, error);
                }
            }
        } catch (error) {
            logger.error('Failed to replicate trade:', error);
        }
    }

    stop() {
        this.redis.quit();
        logger.info('⏹️  Copy Trading Service stopped');
    }
}

if (require.main === module) {
    const service = new CopyTradingService();
    service.initialize();

    process.on('SIGINT', () => {
        service.stop();
        process.exit(0);
    });
}
