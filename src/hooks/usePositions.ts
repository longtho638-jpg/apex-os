import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Position {
    id: string;
    symbol: string;
    type: 'LONG' | 'SHORT';
    entryPrice: number;
    leverage: number;
    size: number;
    timestamp: number;
    status: 'OPEN' | 'CLOSED';
    pnl?: number;
}

export function usePositions() {
    const { user } = useAuth();
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPositions = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/v1/trading/positions?userId=${user.id}`);
            const data = await res.json();
            if (data.success) {
                setPositions(data.positions);
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPositions();
        // Poll every 5 seconds for updates
        const interval = setInterval(fetchPositions, 5000);
        return () => clearInterval(interval);
    }, [fetchPositions]);

    return { positions, loading, refresh: fetchPositions };
}
