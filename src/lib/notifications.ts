import { logger } from '@/lib/logger';
import { createClient } from '@supabase/supabase-js';

export class NotificationService {
    private supabase;

    constructor() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseKey) {
            logger.warn('NotificationService: Missing Supabase credentials');
        }

        this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
    }

    async send(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'MONEY' = 'INFO', metadata: any = {}) {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type,
                    metadata,
                    read: false
                });

            if (error) throw error;

            // Optional: Trigger Realtime Event via Supabase Channels or Redis
            // For now, Supabase Realtime on the table is sufficient for client subscription

        } catch (error) {
            logger.error('Failed to send notification:', error);
        }
    }

    async markAsRead(notificationId: string) {
        await this.supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);
    }

    static async sendAlert(alert: { title: string; message: string; level: string; metadata?: any }) {
        logger.info(`[ALERT] ${alert.level.toUpperCase()}: ${alert.title} - ${alert.message}`, alert.metadata);
        // TODO: Implement actual alert dispatch (e.g. to admin users or external service)
    }
}
