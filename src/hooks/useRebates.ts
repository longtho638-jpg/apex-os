"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRebates, RebateData } from '@/lib/api/rebates';

interface UseRebatesResult {
    data: RebateData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Hook to fetch rebate data with automatic polling
 */
export function useRebates(pollingInterval: number = 60000): UseRebatesResult {
    const { user, token } = useAuth();
    const [data, setData] = useState<RebateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        if (!user || !token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const rebates = await fetchRebates(user.id, token);
            setData(rebates);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Poll for updates
        if (pollingInterval > 0) {
            const interval = setInterval(fetchData, pollingInterval);
            return () => clearInterval(interval);
        }
    }, [user, token, pollingInterval]);

    return { data, loading, error, refetch: fetchData };
}
