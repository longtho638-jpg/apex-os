/**
 * useUserTier - Feature gate hook for Unified Tiers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api/config';
import { TierId, UNIFIED_TIERS, TIER_ORDER } from '@/config/unified-tiers';

export type MenuId = 'overview' | 'trade' | 'pnl' | 'wolfpack' | 'rebates' | 'risk' | 'referrals' | 'reports' | 'billing' | 'resources' | 'settings' | 'admin';

interface TierInfo {
    tier: TierId | 'ADMIN'; // Admin is special case, not in UNIFIED_TIERS
    joinedAt: string | null;
}

export function useUserTier() {
    const { user, isAuthenticated, token } = useAuth();
    const [tierInfo, setTierInfo] = useState<TierInfo>({
        tier: 'FREE',
        joinedAt: null,
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
            cache: 'no-store'
        })
            .then(res => res.json())
            .then(data => {
                // Normalize tier to uppercase to match TierId
                let tier = (data.tier || 'FREE').toUpperCase();

                // Map legacy values if backend returns them
                if (tier === 'FOUNDERS') tier = 'PRO';
                if (tier === 'PREMIUM') tier = 'TRADER';

                setTierInfo({
                    tier: tier,
                    joinedAt: data.joined_at || null,
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch user tier:', err);
                setLoading(false);
            });
    }, [isAuthenticated, user, token]);

    const canViewMenu = (menuId: MenuId): boolean => {
        // Define minimum tier required for each menu
        const minTierForMenu: Record<MenuId, TierId> = {
            overview: 'FREE',
            trade: 'FREE',
            pnl: 'FREE',
            wolfpack: 'PRO', // Was Founders
            rebates: 'FREE',
            risk: 'PRO', // Was Founders
            referrals: 'FREE',
            reports: 'FREE',
            billing: 'FREE',
            resources: 'FREE',
            settings: 'FREE',
            admin: 'ELITE' // Admin only (handled separately usually)
        };

        if (tierInfo.tier === 'ADMIN') return true;

        const requiredTier = minTierForMenu[menuId];
        if (!requiredTier) return true;

        // Check if current tier index >= required tier index
        const currentIndex = TIER_ORDER.indexOf(tierInfo.tier as TierId);
        const requiredIndex = TIER_ORDER.indexOf(requiredTier);

        return currentIndex >= requiredIndex;
    };

    return {
        ...tierInfo,
        loading,
        isAdmin: tierInfo.tier === 'ADMIN',
        isFree: tierInfo.tier === 'FREE',
        isPro: tierInfo.tier === 'PRO',
        isTrader: tierInfo.tier === 'TRADER',
        isElite: tierInfo.tier === 'ELITE',
        canViewMenu,

        // Feature access helpers
        canUseAgent: () => tierInfo.tier !== 'FREE',
        canViewLifetimeData: () => tierInfo.tier !== 'FREE',
        canExportPDF: () => tierInfo.tier !== 'FREE',
        canEarnReferrals: () => tierInfo.tier !== 'FREE', // Or maybe FREE can earn L1? Check unified-tiers.ts (Free has 0%)
        maxTradeHistory: tierInfo.tier === 'FREE' ? 30 : -1,
    };
}
