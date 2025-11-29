import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const body: any = await request.json();
        const signature = request.headers.get('x-nowpayments-sig');

        if (!signature) {
            return NextResponse.json({ error: 'No signature provided' }, { status: 401 });
        }

        const secret = process.env.NOWPAYMENTS_IPN_SECRET;
        if (!secret) {
            console.error('NOWPAYMENTS_IPN_SECRET not set');
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        // Verify Signature
        const sortedKeys = Object.keys(body).sort();
        const hmac = crypto.createHmac('sha512', secret);
        hmac.update(JSON.stringify(body, sortedKeys));
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== signature) {
            console.error('Payout Signature mismatch');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Body structure depends on NOWPayments Payout IPN
        // Usually: { id: '...', status: 'FINISHED', batch_withdrawal_id: '...', error: '...', hash: '...' }
        const { id, status, error, hash, fee } = body;

        if (!id) {
            return NextResponse.json({ received: true });
        }

        // Find the withdrawal request by payout_id (stored in metadata)
        // We need to query using the JSONB containment operator @> or ->>
        const { data: withdrawalRequest, error: findError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .filter('metadata->>payout_id', 'eq', id)
            .single();

        if (findError || !withdrawalRequest) {
            console.error(`Withdrawal not found for payout_id: ${id}`);
            return NextResponse.json({ received: true });
        }

        if (withdrawalRequest.status === 'completed' || withdrawalRequest.status === 'execution_failed') {
            // Already processed
            return NextResponse.json({ received: true });
        }

        if (status === 'FINISHED') {
            // Success
            await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'completed',
                    tx_hash: hash,
                    tx_fee: fee,
                    payout_provider: 'nowpayments',
                    executed_at: new Date().toISOString()
                })
                .eq('id', withdrawalRequest.id);

            // Finalize Wallet Balance (RPC)
            await supabase.rpc('finalize_withdrawal', {
                p_user_id: withdrawalRequest.user_id,
                p_amount: withdrawalRequest.amount
            });

            // Log Audit
            await supabase.from('withdrawal_audit_log').insert({
                withdrawal_id: withdrawalRequest.id,
                event_type: 'payout_webhook_success',
                actor: 'system:webhook',
                previous_status: withdrawalRequest.status,
                new_status: 'completed',
                metadata: { webhook_body: body }
            });

        } else if (status === 'FAILED' || status === 'REJECTED') {
            // Failure
            await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'execution_failed',
                    agent_notes: `Payout Failed: ${error || 'Unknown error'}`
                })
                .eq('id', withdrawalRequest.id);

            // Release Reserved Balance
            await supabase.rpc('release_reserved_balance', {
                p_user_id: withdrawalRequest.user_id,
                p_amount: withdrawalRequest.amount
            });

            // Log Audit
            await supabase.from('withdrawal_audit_log').insert({
                withdrawal_id: withdrawalRequest.id,
                event_type: 'payout_webhook_failed',
                actor: 'system:webhook',
                previous_status: withdrawalRequest.status,
                new_status: 'execution_failed',
                metadata: { webhook_body: body }
            });
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Payout Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
