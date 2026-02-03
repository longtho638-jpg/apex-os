import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { executeWithdrawal } from '@/lib/agents/execution-agent';
import { auditService } from '@/lib/audit';

// ... (rest of imports/functions)

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { withdrawal_id, decision, admin_id, notes } = body;

        // ... (validation and auth)

        if (!withdrawal_id || !decision || !admin_id) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ... (fetch request)
        const { data: request, error: fetchError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', withdrawal_id)
            .single();

        if (fetchError || !request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (request.status !== 'flagged') {
            return NextResponse.json({ error: 'Request is not flagged' }, { status: 400 });
        }

        // 3. Handle Decision
        if (decision === 'approve') {
            // Update to approved
            const { error: updateError } = await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'approved', // Ready for execution
                    approved_by: admin_id,
                    approved_at: new Date().toISOString(),
                    agent_notes: request.agent_notes + ` | Super Admin Approved: ${notes || 'No notes'}`
                })
                .eq('id', withdrawal_id);

            if (updateError) throw updateError;

            // Execute immediately
            const result = await executeWithdrawal(withdrawal_id);

            // AUDIT LOG
            await auditService.log({
                userId: admin_id,
                action: 'WITHDRAWAL_RESOLVED_APPROVED',
                resourceType: 'WITHDRAWAL',
                resourceId: withdrawal_id,
                newValue: { decision, notes, result }
            });

            return NextResponse.json({ success: true, action: 'approved', execution: result });

        } else if (decision === 'reject') {
            // Reject and Release Funds
            await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'rejected',
                    agent_notes: request.agent_notes + ` | Super Admin Rejected: ${notes || 'No notes'}`
                })
                .eq('id', withdrawal_id);

            // Release reserved balance
            await supabase.rpc('release_reserved_balance', {
                p_user_id: request.user_id,
                p_amount: request.amount
            });

            // AUDIT LOG
            await auditService.log({
                userId: admin_id,
                action: 'WITHDRAWAL_RESOLVED_REJECTED',
                resourceType: 'WITHDRAWAL',
                resourceId: withdrawal_id,
                newValue: { decision, notes }
            });

            return NextResponse.json({ success: true, action: 'rejected' });
        } else {
            return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
        }

    } catch (error: any) {
        logger.error('Super Admin Resolution Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
