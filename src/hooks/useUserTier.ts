/**
 * useUserTier - Feature gate hook for Free/Founders/Admin tiers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api/config';

export type UserTier = 'free' | 'founders' | 'admin';
export type MenuId = 'overview' | 'trade' | 'pnl' | 'wolfpack' | 'rebates' | 'risk' | 'referrals' | 'reports' | 'billing' | 'resources' | 'settings' | 'admin';

interface TierInfo {
    tier: UserTier;
    slot: number | null;
    joinedAt: string | null;
    totalFounders: number;
}

export function useUserTier() {
    const { user, isAuthenticated, token } = useAuth();
    const [tierInfo, setTierInfo] = useState<TierInfo>({
        tier: 'free',
        slot: null,
        joinedAt: null,
        totalFounders: 87 // Default fallback (13 spots left)
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user || !token) {
            setLoading(false);
            return;
        }

        // Fetch tier from backend
        const baseUrl = getApiUrl();

        fetch(`${baseUrl}/user/tier`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store' // Disable caching to ensure fresh tier data
        })
            .then(res => res.json())
            .then(data => {
                console.log('User Tier API Response:', data); // Debug log
                setTierInfo({
                    tier: data.tier || 'free',
                    slot: data.slot_number || null,
                    joinedAt: data.joined_at || null,
                    totalFounders: data.total_founders ?? 87 // Use API data or fallback
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch user tier:', err);
                setLoading(false);
            });
    }, [isAuthenticated, user, token]);

    const canViewMenu = (menuId: MenuId): boolean => {
        const menuAccess: Record<MenuId, UserTier[]> = {
            overview: ['free', 'founders', 'admin'],
            trade: ['free', 'founders', 'admin'],
            pnl: ['free', 'founders', 'admin'],
            wolfpack: ['founders', 'admin'], // Hidden from free
            rebates: ['free', 'founders', 'admin'], // All users
            risk: ['founders', 'admin'], // Founders only
            referrals: ['free', 'founders', 'admin'], // All (teaser for free)
            reports: ['free', 'founders', 'admin'],
            billing: ['free', 'founders', 'admin'], // Payment page for all
            resources: ['free', 'founders', 'admin'],
            settings: ['free', 'founders', 'admin'],
            admin: ['admin'] // Admin only
        };

        return menuAccess[menuId]?.includes(tierInfo.tier) ?? false;
    };

    const MAX_FOUNDERS = 100;
    const foundersSlotsLeft = Math.max(0, MAX_FOUNDERS - tierInfo.totalFounders);

    return {
        ...tierInfo,
        loading,
        isFounders: tierInfo.tier === 'founders',
        isAdmin: tierInfo.tier === 'admin',
        isFree: tierInfo.tier === 'free',
        foundersSlotsLeft,
        canViewMenu,

        // Feature access helpers
        canUseAgent: () => tierInfo.tier !== 'free',
        canViewLifetimeData: () => tierInfo.tier !== 'free',
        canExportPDF: () => tierInfo.tier !== 'free',
        canEarnReferrals: () => tierInfo.tier !== 'free',
        maxTradeHistory: tierInfo.tier === 'free' ? 30 : -1, // -1 = unlimited
    };
}
