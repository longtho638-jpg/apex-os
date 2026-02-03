import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export type NotificationType = 'AMBIENT' | 'NECTAR' | 'CRITICAL';

export interface NotificationPayload {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    metadata?: any;
}

export class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Create a new notification in the database.
     * This will trigger Realtime updates for connected clients.
     */
    async create(payload: NotificationPayload) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('notifications')
            .insert({
                user_id: payload.userId,
                type: payload.type,
                title: payload.title,
                message: payload.message,
                action_url: payload.actionUrl,
                metadata: payload.metadata,
                is_read: false,
            })
            .select()
            .single();

        if (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }

        return data;
    }

    /**
     * Mark a notification as read.
     */
    async markAsRead(notificationId: string) {
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (error) {
            logger.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user.
     */
    async markAllAsRead(userId: string) {
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId);

        if (error) {
            logger.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications for a user.
     */
    async getUnread(userId: string) {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('Error fetching unread notifications:', error);
            throw error;
        }

        return data;
    }
}

export const notificationService = NotificationService.getInstance();
