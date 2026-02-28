"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchBillingInfo, RaaSBillingInfo } from '@/lib/api/billing';

interface UseSubscriptionResult {
    data: RaaSBillingInfo | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
}

/**
 * Hook to fetch RaaS billing/tier information
 */
export function useSubscription(): UseSubscriptionResult {
    const { user, token } = useAuth();
    const [data, setData] = useState<RaaSBillingInfo | null>(null);
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
            const info = await fetchBillingInfo(user.id, token);
            setData(info);
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
