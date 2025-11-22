/**
 * useUserTier - Feature gate hook for Free/Founders/Admin tiers
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type UserTier = 'free' | 'founders' | 'admin';
export type MenuId = 'overview' | 'trade' | 'pnl' | 'wolfpack' | 'audit' | 'guardian' | 'referrals' | 'reports' | 'billing' | 'resources' | 'settings' | 'admin';

interface TierInfo {
    tier: UserTier;
    slot: number | null;
    joinedAt: string | null;
}

export function useUserTier() {
    const { user, isAuthenticated, token } = useAuth();
    const [tierInfo, setTierInfo] = useState<TierInfo>({
        tier: 'free',
        slot: null,
        joinedAt: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated || !user || !token) {
            setLoading(false);
            return;
        }

        // Fetch tier from backend
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/tier`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setTierInfo({
                    tier: data.tier || 'free',
                    slot: data.slot_number || null,
                    joinedAt: data.joined_at || null
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
            audit: ['founders', 'admin'], // Founders only
            guardian: ['founders', 'admin'],
            referrals: ['free', 'founders', 'admin'], // All (teaser for free)
            reports: ['free', 'founders', 'admin'],
            billing: ['founders', 'admin'], // Hidden from free
            resources: ['free', 'founders', 'admin'],
            settings: ['free', 'founders', 'admin'],
            admin: ['admin'] // Admin only
        };

        return menuAccess[menuId]?.includes(tierInfo.tier) ?? false;
    };

    return {
        ...tierInfo,
        loading,
        isFounders: tierInfo.tier === 'founders',
        isAdmin: tierInfo.tier === 'admin',
        isFree: tierInfo.tier === 'free',
        canViewMenu,

        // Feature access helpers
        canUseAgent: () => tierInfo.tier !== 'free',
        canViewLifetimeData: () => tierInfo.tier !== 'free',
        canExportPDF: () => tierInfo.tier !== 'free',
        canEarnReferrals: () => tierInfo.tier !== 'free',
        maxTradeHistory: tierInfo.tier === 'free' ? 30 : -1, // -1 = unlimited
    };
}
