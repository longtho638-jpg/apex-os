import { logger } from '@/lib/logger';
/**
 * IP Whitelist Toggle API
 * POST - Enable/disable IP whitelisting for admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClientIP, logSecurityEvent } from '@/lib/auth/ip-whitelist';
import { auditService } from '@/lib/audit';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { adminId, enabled } = await request.json();

        if (!adminId || typeof enabled !== 'boolean') {
            return NextResponse.json(
                { error: 'Admin ID and enabled flag are required' },
                { status: 400 }
            );
        }

        // Update IP whitelist enabled status
        const { error } = await supabase
            .from('admin_users')
            .update({ ip_whitelist_enabled: enabled })
            .eq('id', adminId);

        if (error) {
            logger.error('Error toggling IP whitelist:', error);
            return NextResponse.json(
                { error: 'Failed to toggle IP whitelist' },
                { status: 500 }
            );
        }

        // Log security event (Legacy/Guardian)
        await logSecurityEvent({
            type: 'IP_WHITELIST_CHANGED',
            adminId,
            ipAddress: getClientIP(request),
            metadata: { action: 'toggle', enabled }
        });

        // Log audit action (New Audit System)
        await auditService.log({
            userId: adminId,
            action: 'IP_WHITELIST_TOGGLED',
            resourceType: 'IP_WHITELIST',
            resourceId: adminId, // Global setting for admin
            newValue: { enabled },
            ipAddress: getClientIP(request),
            userAgent: request.headers.get('user-agent') || undefined
        });

        return NextResponse.json({
            success: true,
            enabled,
            message: enabled
                ? 'IP whitelisting enabled'
                : 'IP whitelisting disabled'
        });

    } catch (error) {
        logger.error('IP whitelist toggle error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
