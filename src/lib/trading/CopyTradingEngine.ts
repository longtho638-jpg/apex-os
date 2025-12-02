import { createClient } from '@/lib/supabase/server';

interface TradeSignal {
    leaderId: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    leverage: number;
}

export class CopyTradingEngine {
    /**
     * Execute copy trades for a given leader signal
     */
    static async processSignal(signal: TradeSignal) {
        const supabase = await createClient();

        console.log(`[CopyEngine] Processing signal from leader ${signal.leaderId} for ${signal.symbol}`);

        // 1. Get all active followers for this leader
        const { data: followers, error: followerError } = await supabase
            .from('copy_settings')
            .select('*')
            .eq('leader_id', signal.leaderId)
            .eq('status', 'ACTIVE');

        if (followerError) {
            console.error('[CopyEngine] Failed to fetch followers:', followerError);
            return;
        }

        if (!followers || followers.length === 0) {
            console.log('[CopyEngine] No active followers found.');
            return;
        }

        console.log(`[CopyEngine] Found ${followers.length} followers. Executing trades...`);

        // 2. Execute trade for each follower
        const tradePromises = followers.map(async (setting) => {
            try {
                // Calculate Position Size
                // Logic: Use the allocated 'copy_amount' as the margin
                const margin = setting.copy_amount;
                const size = margin * signal.leverage; // Total position size

                // Insert Position into Database
                const { error: tradeError } = await supabase
                    .from('positions')
                    .insert({
                        user_id: setting.follower_id,
                        symbol: signal.symbol,
                        type: signal.type,
                        entry_price: signal.entryPrice,
                        size: size,
                        leverage: signal.leverage,
                        entry_time: new Date().toISOString(),
                        status: 'OPEN',
                        pnl: 0, // Initial PnL
                        copy_leader_id: signal.leaderId // Track who we copied
                    });

                if (tradeError) throw tradeError;

                console.log(`[CopyEngine] ✅ Executed trade for user ${setting.follower_id}`);

                // Log to history
                await supabase.from('copy_trade_history').insert({
                    copy_setting_id: setting.id,
                    pnl: 0,
                    status: 'OPEN'
                });

            } catch (err) {
                console.error(`[CopyEngine] ❌ Failed to execute for user ${setting.follower_id}:`, err);
            }
        });

        await Promise.all(tradePromises);
        return { success: true, executedCount: followers.length };
    }
}
