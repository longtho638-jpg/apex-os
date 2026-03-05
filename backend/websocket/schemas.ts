import { z } from 'zod';

export const SubscribeSchema = z.object({
    type: z.literal('SUBSCRIBE'),
    symbols: z.array(z.string()).min(1).max(50), // Limit max symbols per request
    userId: z.string().optional()
});

export const UnsubscribeSchema = z.object({
    type: z.literal('UNSUBSCRIBE'),
    symbols: z.array(z.string()).min(1).max(50),
    userId: z.string().optional()
});

export const PingSchema = z.object({
    type: z.literal('PING'),
    userId: z.string().optional()
});

export const WSMessageSchema = z.discriminatedUnion('type', [
    SubscribeSchema,
    UnsubscribeSchema,
    PingSchema
]);

export type WSMessage = z.infer<typeof WSMessageSchema>;
