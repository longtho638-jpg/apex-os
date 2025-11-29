import { getSupabaseClient } from '@/lib/supabase';

export type CRMEventType =
    | 'PAGE_VIEW'
    | 'CLICK'
    | 'FORM_SUBMIT'
    | 'EMAIL_SENT'
    | 'EMAIL_OPEN'
    | 'TRADE_EXECUTE'
    | 'DEPOSIT'
    | 'LOGIN'
    | 'SIGNUP';

export type CRMStage =
    | 'LEAD_NEW'
    | 'LEAD_QUALIFIED'
    | 'OPPORTUNITY_ACTIVE'
    | 'CUSTOMER_PAID'
    | 'CUSTOMER_VIP'
    | 'PARTNER_B2B'
    | 'CHURN_RISK';

export class CRMService {
    private static instance: CRMService;

    private constructor() { }

    public static getInstance(): CRMService {
        if (!CRMService.instance) {
            CRMService.instance = new CRMService();
        }
        return CRMService.instance;
    }

    /**
     * Track a user event in the "Beehive"
     */
    public async track(userId: string, event: CRMEventType, metadata: any = {}, severity: 'INFO' | 'WARN' | 'SUCCESS' | 'CRITICAL' = 'INFO') {
        try {
            const supabase = getSupabaseClient();

            // 1. Log Event
            await supabase.from('crm_events').insert({
                user_id: userId,
                event_type: event,
                metadata,
                severity
            });

            // 2. Update Pipeline Score (Simple Logic)
            if (event === 'TRADE_EXECUTE') await this.updateScore(userId, 10);
            if (event === 'DEPOSIT') await this.updateScore(userId, 50);
            if (event === 'LOGIN') await this.updateScore(userId, 1);

        } catch (error) {
            console.error('[CRM] Failed to track event:', error);
        }
    }

    /**
     * Update User Stage in the Pipeline
     */
    public async updateStage(userId: string, stage: CRMStage) {
        try {
            const supabase = getSupabaseClient();
            await supabase.from('crm_pipelines').upsert({
                user_id: userId,
                stage,
                last_interaction: new Date().toISOString()
            });
        } catch (error) {
            console.error('[CRM] Failed to update stage:', error);
        }
    }

    /**
     * Update Lead Score
     */
    private async updateScore(userId: string, points: number) {
        try {
            const supabase = getSupabaseClient();
            // This is a simplified increment. In a real app, we'd use an RPC function.
            // For now, we fetch and update.
            const { data } = await supabase.from('crm_pipelines').select('score').eq('user_id', userId).single();
            const currentScore = data?.score || 0;

            await supabase.from('crm_pipelines').upsert({
                user_id: userId,
                score: currentScore + points,
                last_interaction: new Date().toISOString()
            });
        } catch (error) {
            console.error('[CRM] Failed to update score:', error);
        }
    }
    /**
     * Update pipeline metadata (e.g. Ghost Profit)
     */
    async updatePipelineMetadata(userId: string, metadata: any) {
        const supabase = getSupabaseClient();

        // First get existing metadata
        const { data: existing, error: fetchError } = await supabase
            .from('crm_pipelines')
            .select('metadata')
            .eq('user_id', userId)
            .single();

        if (fetchError) {
            console.error('Error fetching pipeline metadata:', fetchError);
            return;
        }

        const newMetadata = { ...existing?.metadata, ...metadata };

        const { error } = await supabase
            .from('crm_pipelines')
            .update({ metadata: newMetadata })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating pipeline metadata:', error);
        }
    }
}

export const crmService = CRMService.getInstance();
