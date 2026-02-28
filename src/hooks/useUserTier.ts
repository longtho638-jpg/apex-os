import { logger } from '@/lib/logger';
/**
 * useUserTier - Feature gate hook for Unified Tiers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api/config';
import { TierId, AnyTierId, TIER_ORDER } from '@/config/unified-tiers';

export type MenuId = 'overview' | 'trade' | 'copy-trading' | 'pnl' | 'wolfpack' | 'rebates' | 'risk' | 'referrals' | 'reports' | 'billing' | 'resources' | 'settings' | 'admin';

interface TierInfo {
    tier: TierId | 'ADMIN';
    joinedAt: string | null;
}

/** Map legacy tier names to RaaS volume-based tier names */
function normalizeTier(raw: string): TierId {
    const legacy: Record<string, TierId> = {
      FREE: 'EXPLORER', FOUNDERS: 'SOVEREIGN', PREMIUM: 'ARCHITECT',
      PRO: 'OPERATOR', TRADER: 'ARCHITECT', ELITE: 'SOVEREIGN', WHALE: 'SOVEREIGN',
    };
    const upper = raw.toUpperCase();
    if (TIER_ORDER.includes(upper as TierId)) return upper as TierId;
    return legacy[upper] || 'EXPLORER';
}

export function useUserTier() {
    const { user, isAuthenticated, token } = useAuth();
    const [tierInfo, setTierInfo] = useState<TierInfo>({
        tier: 'EXPLORER',
        joinedAt: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user || !token) {
            setLoading(false);
            return;
        }

        const baseUrl = getApiUrl();

        fetch(`${baseUrl}/user/tier`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        })
            .then(res => res.json())
            .then(data => {
                const tier = data.tier === 'ADMIN' ? 'ADMIN' as const : normalizeTier(data.tier || 'EXPLORER');
                setTierInfo({ tier, joinedAt: data.joined_at || null });
                setLoading(false);
            })
            .catch(err => {
                logger.error('Failed to fetch user tier:', err);
                setLoading(false);
            });
    }, [isAuthenticated, user, token]);

    const canViewMenu = (menuId: MenuId): boolean => {
        const minTierForMenu: Record<MenuId, TierId> = {
            overview: 'EXPLORER',
            trade: 'EXPLORER',
            'copy-trading': 'EXPLORER',
            pnl: 'EXPLORER',
            wolfpack: 'OPERATOR',
            rebates: 'EXPLORER',
            risk: 'OPERATOR',
            referrals: 'EXPLORER',
            reports: 'EXPLORER',
            billing: 'EXPLORER',
            resources: 'EXPLORER',
            settings: 'EXPLORER',
            admin: 'SOVEREIGN'
        };

        if (tierInfo.tier === 'ADMIN') return true;

        const requiredTier = minTierForMenu[menuId];
        if (!requiredTier) return true;

        const currentIndex = TIER_ORDER.indexOf(tierInfo.tier as TierId);
        const requiredIndex = TIER_ORDER.indexOf(requiredTier);

        return currentIndex >= requiredIndex;
    };

    // Helper: check if tier >= threshold (works with legacy names too)
    const isAtLeast = (threshold: AnyTierId): boolean => {
        if (tierInfo.tier === 'ADMIN') return true;
        const normalizedThreshold = normalizeTier(threshold);
        const currentIdx = TIER_ORDER.indexOf(tierInfo.tier as TierId);
        const thresholdIdx = TIER_ORDER.indexOf(normalizedThreshold);
        return currentIdx >= thresholdIdx;
    };

    return {
        ...tierInfo,
        loading,
        isAdmin: tierInfo.tier === 'ADMIN' || tierInfo.tier === 'SOVEREIGN',
        isExplorer: tierInfo.tier === 'EXPLORER',
        isOperator: tierInfo.tier === 'OPERATOR',
        isArchitect: tierInfo.tier === 'ARCHITECT',
        isSovereign: tierInfo.tier === 'SOVEREIGN',
        // Legacy aliases for backward compat
        isFree: tierInfo.tier === 'EXPLORER',
        isPro: tierInfo.tier === 'OPERATOR',
        isTrader: tierInfo.tier === 'ARCHITECT',
        isElite: tierInfo.tier === 'SOVEREIGN',
        isWhale: tierInfo.tier === 'SOVEREIGN',
        canViewMenu,
        isAtLeast,

        // Feature access
        canUseAgent: () => tierInfo.tier !== 'EXPLORER',
        canViewLifetimeData: () => tierInfo.tier !== 'EXPLORER',
        canExportPDF: () => tierInfo.tier !== 'EXPLORER',
        canEarnReferrals: () => true, // RaaS: everyone earns referrals
        maxTradeHistory: tierInfo.tier === 'EXPLORER' ? 30 : -1,
    };
}
