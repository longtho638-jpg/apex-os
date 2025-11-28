/**
 * Wolf Pack API client and TypeScript types
 */

import { get } from './client';

export interface WolfPackStatus {
    in_pack: boolean;
    pack_id: string | null;
    member_count: number;
    total_volume: number;
    shared_rebates: number;
    members: Array<{
        user_id: string;
        role: 'alpha' | 'beta' | 'omega' | 'member';
        contribution: number;
        joined_at: string;
    }>;
    invite_link: string;
}

/**
 * Fetch Wolf Pack status for a user
 */
export async function fetchWolfPackStatus(
    userId: string,
    token?: string
): Promise<WolfPackStatus> {
    return get<WolfPackStatus>('/wolf-pack/status', {
        params: { user_id: userId },
        token,
    });
}
