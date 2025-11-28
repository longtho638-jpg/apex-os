'use client';

import { useEffect, useRef, useState } from 'react';
import { create } from 'zustand';

interface PriceData {
    symbol: string;
    price: number;
    bid: number;
    ask: number;
    timestamp: number;
}

interface PriceStore {
    prices: Map<string, PriceData>;
    connected: boolean;
    updatePrice: (symbol: string, data: PriceData) => void;
    setConnected: (status: boolean) => void;
    getPrice: (symbol: string) => PriceData | undefined;
}

export const usePriceStore = create<PriceStore>((set, get) => ({
    prices: new Map(),
    connected: false,
    updatePrice: (symbol, data) =>
        set((state) => {
            const newPrices = new Map(state.prices);
            newPrices.set(symbol, data);
            return { prices: newPrices };
        }),
    setConnected: (connected) => set({ connected }),
    getPrice: (symbol) => get().prices.get(symbol),
}));

interface UsePriceStreamOptions {
    symbols: string[];
    autoConnect?: boolean;
}

export function usePriceStream({ symbols, autoConnect = true }: UsePriceStreamOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { updatePrice, setConnected, connected, prices } = usePriceStore();
    const [error, setError] = useState<string | null>(null);

    const connect = () => {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

        try {
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setConnected(true);
                setError(null);

                // Subscribe to symbols
                ws.send(JSON.stringify({
                    type: 'SUBSCRIBE',
                    symbols
                }));

                // Start heartbeat
                const heartbeat = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: 'PING' }));
                    }
                }, 30000); // Ping every 30 seconds

                ws.addEventListener('close', () => {
                    clearInterval(heartbeat);
                });
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'PRICE_UPDATE') {
                        updatePrice(message.data.symbol, message.data);
                    } else if (message.type === 'SUBSCRIBED') {
                        console.log('✅ Subscribed to:', message.symbols);
                    } else if (message.type === 'PONG') {
                        // Heartbeat response
                    }
                } catch (err) {
                    console.error('❌ WebSocket message error:', err);
                }
            };

            ws.onerror = (event) => {
                console.error('❌ WebSocket error:', event);
                setError('WebSocket connection error');
            };

            ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                setConnected(false);

                // Auto-reconnect after 3 seconds
                if (autoConnect) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('🔄 Reconnecting...');
                        connect();
                    }, 3000);
                }
            };
        } catch (err) {
            console.error('❌ Failed to create WebSocket:', err);
            setError('Failed to connect to WebSocket server');
        }
    };

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            // Unsubscribe before closing
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'UNSUBSCRIBE',
                    symbols
                }));
            }
            wsRef.current.close();
            wsRef.current = null;
        }
    };

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [symbols.join(',')]); // Reconnect if symbols change

    return {
        connected,
        error,
        prices: Array.from(prices.entries()).map(([sym, data]) => ({
            ...data,
            symbol: sym
        })),
        getPrice: (symbol: string) => usePriceStore.getState().getPrice(symbol),
        connect,
        disconnect
    };
}
