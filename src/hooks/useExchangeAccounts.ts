import { useState, useEffect } from 'react';
import { getSupabaseClientSide } from '@/lib/supabase';
import { LinkedAccount, ExchangeFormValues } from '@/types/exchange';
import { useAuth } from '@/contexts/AuthContext';
import DOMPurify from 'isomorphic-dompurify';

export function useExchangeAccounts() {
    const { user, token } = useAuth();
    const supabase = getSupabaseClientSide();
    const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('user_exchange_accounts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLinkedAccounts(data as LinkedAccount[] || []);
        } catch (err: any) {
            console.error('Error fetching accounts:', err);
            setError('Failed to load linked accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [user]);

    const addAccount = async (data: ExchangeFormValues) => {
        if (!token) throw new Error('Not authenticated');

        const sanitizedUid = DOMPurify.sanitize(data.user_uid).trim();

        const response = await fetch('/api/v1/user/verify-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                exchange: data.exchange,
                user_uid: sanitizedUid
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to link account');
        }

        await fetchAccounts();
        return result;
    };

    const deleteAccount = async (id: string) => {
        // Optimistic Update
        const previousAccounts = [...linkedAccounts];
        setLinkedAccounts(prev => prev.filter(acc => acc.id !== id));

        try {
            const { error } = await supabase
                .from('user_exchange_accounts')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err: any) {
            console.error('Error deleting account:', err);
            setError('Failed to delete account');
            setLinkedAccounts(previousAccounts); // Revert
            throw err;
        }
    };

    return {
        linkedAccounts,
        loading,
        error,
        addAccount,
        deleteAccount,
        refreshAccounts: fetchAccounts
    };
}
