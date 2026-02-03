'use client';

import { logger } from '@/lib/logger';
import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';

interface PriceUpdate {
    symbol: string;
    price: number;
    bid: number;
    ask: number;
    timestamp: number;
}

interface WebSocketStore {
    prices: Map<string, PriceUpdate>;
    connected: boolean;
    updatePrice: (symbol: string, data: PriceUpdate) => void;
    setConnected: (connected: boolean) => void;
    cleanup?: () => void;
}

export const useWebSocketStore = create<WebSocketStore>((set) => ({
    prices: new Map(),
    connected: false,
    updatePrice: (symbol, data) =>
        set((state) => {
            const newPrices = new Map(state.prices);
            newPrices.set(symbol, data);
            return { prices: newPrices };
        }),
    cleanup: () =>
        set((state) => {
            const maxAge = 5 * 60 * 1000; // 5 minutes
            const now = Date.now();
            let hasChanges = false;
            const newPrices = new Map(state.prices);

            for (const [symbol, data] of newPrices) {
                if (now - data.timestamp > maxAge) {
                    newPrices.delete(symbol);
                    hasChanges = true;
                }
            }

            return hasChanges ? { prices: newPrices } : {};
        }),
    setConnected: (connected) => set({ connected }),
}));

// Cleanup interval
if (typeof window !== 'undefined') {
    setInterval(() => {
        useWebSocketStore.getState().cleanup?.();
    }, 60000); // Check every minute
}


export function useWebSocket(symbols: string[]) {
    const wsRef = useRef<WebSocket | null>(null);
    const { updatePrice, setConnected } = useWebSocketStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Use env var or default to localhost:8080
        const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            logger.info('✅ WebSocket connected');
            setConnected(true);
            setError(null);

            // Subscribe to symbols
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'SUBSCRIBE',
                    symbols
                }));
            }
        };

        ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === 'PRICE_UPDATE') {
                    updatePrice(message.data.symbol, message.data);
                }
            } catch (err) {
                logger.error('❌ WebSocket message error:', err);
            }
        };

        ws.onerror = (event) => {
            logger.error('❌ WebSocket error:', event);
            setError('WebSocket connection error');
        };

        ws.onclose = () => {
            logger.info('❌ WebSocket disconnected');
            setConnected(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'UNSUBSCRIBE',
                    symbols
                }));
            }
            ws.close();
        };
    }, [symbols.join(',')]);

    return { error };
}
