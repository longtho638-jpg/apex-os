"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWolfPackStatus, WolfPackStatus } from '@/lib/api/wolfpack';

interface UseWolfPackResult {
    data: WolfPackStatus | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Hook to fetch Wolf Pack status
 */
export function useWolfPack(): UseWolfPackResult {
    const { user, token } = useAuth();
    const [data, setData] = useState<WolfPackStatus | null>(null);
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
            const status = await fetchWolfPackStatus(user.id, token);
            setData(status);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user, token]);

    return { data, loading, error, refetch: fetchData };
}
