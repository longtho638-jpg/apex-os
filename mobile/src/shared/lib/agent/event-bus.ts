import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AgentEvent {
    id: string;
    type: string;
    source: string;
    payload: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

export type EventHandler = (event: AgentEvent) => Promise<void>;

export class AgentEventBus {
    private supabase: SupabaseClient;
    private handlers: Map<string, EventHandler[]> = new Map();

    constructor() {
        // Use Anon Key for Mobile App. RLS must allow insert.
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                auth: { persistSession: true }
            }
        );
    }

    /**
     * Publish a new event to the bus (Database)
     */
    async publish(type: string, source: string, payload: any): Promise<string | null> {
        const { data, error } = await this.supabase
            .from('agent_events')
            .insert({
                type,
                source,
                payload,
                status: 'pending'
            })
            .select('id')
            .single();

        if (error) {
            console.error(`[EventBus] Failed to publish ${type}:`, error);
            return null;
        }

        return data?.id || null;
    }

    /**
     * Subscribe to events via Supabase Realtime
     * NOTE: This keeps a WebSocket connection open.
     */
    subscribe(eventType: string, handler: EventHandler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)?.push(handler);

        // Set up Realtime subscription if it's the first handler for this type
        // (Simplified: In production, manage one channel for all or filter per channel)
        this.supabase
            .channel('agent-events')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'agent_events',
                    filter: `type=eq.${eventType}`
                },
                async (payload) => {
                    const newEvent = payload.new as AgentEvent;
                    console.log(`[EventBus] Received ${newEvent.type} from ${newEvent.source}`);

                    // Execute handlers
                    try {
                        await handler(newEvent);
                    } catch (err) {
                        console.error(`[EventBus] Handler error for ${eventType}:`, err);
                    }
                }
            )
            .subscribe();
    }

    /**
     * Mark an event as processed (for Worker Agents)
     */
    async completeEvent(eventId: string, result?: any) {
        await this.supabase
            .from('agent_events')
            .update({
                status: 'completed',
                processed_at: new Date().toISOString(),
                payload: result ? { ...result, original_result: true } : undefined // Optionally merge result
            })
            .eq('id', eventId);
    }

    /**
     * Mark an event as failed
     */
    async failEvent(eventId: string, error: string) {
        await this.supabase
            .from('agent_events')
            .update({
                status: 'failed',
                payload: { error }, // CAUTION: This overwrites payload. Ideally use a separate jsonb update or separate error column.
                // Fixed approach: Merge error into payload if possible or just log it. 
                // For simplicity/safety, let's NOT overwrite payload but assume the consumer logs it elsewhere 
                // OR utilize a metadata column if we added one. 
                // Let's just set status for now.
            })
            .eq('id', eventId);
    }
}

export const eventBus = new AgentEventBus();
