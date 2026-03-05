import crypto from 'node:crypto';
import { nowPayments } from '@apex-os/vibe-payment';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function executeWithdrawal(withdrawalId: string) {
  const supabase = getSupabaseClient();

  try {
    // 1. Fetch Approved Request
    const { data: request, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      // .eq('status', 'approved') // Ensure it's approved
      .single();

    if (error || !request) {
      throw new Error('Withdrawal not found or not ready');
    }

    if (request.status !== 'approved') {
      throw new Error(`Invalid status: ${request.status}`);
    }

    // 2. Verify Checksum (Defense in Depth)
    const nonce = request.agent_notes?.split('nonce:')[1] || '';
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(
        `${request.user_id}:${request.amount}:${request.crypto_address}:${nonce}:${process.env.SUPABASE_JWT_SECRET}`,
      )
      .digest('hex');

    if (request.data_checksum !== expectedChecksum) {
      throw new Error('FATAL: Data integrity check failed before execution');
    }

    // 3. Mark as Executing
    await supabase
      .from('withdrawal_requests')
      .update({ status: 'executing', executed_at: new Date().toISOString() })
      .eq('id', withdrawalId);

    // 4. Call NOWPayments
    const result = await nowPayments.createPayout({
      address: request.crypto_address,
      amount: request.amount,
      currency: 'usdttrc20', // Force USDT TRC20
      withdrawal_id: withdrawalId,
    });

    if (!result.success) {
      throw new Error(result.error || 'Unknown NOWPayments error');
    }

    // 4.5 Save Payout ID immediately (for Webhook matching)
    await supabase
      .from('withdrawal_requests')
      .update({
        metadata: { payout_id: result.payout_id },
      })
      .eq('id', withdrawalId);

    // 5. Wait/Poll for Tx Hash (Optional: or wait for webhook)
    // For better UX, we poll briefly.
    let txHash = '';
    let fee = 0;

    // Poll a few times
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 2000)); // Wait 2s
      const status = await nowPayments.getPayoutStatus(result.payout_id!);
      if (status.status === 'FINISHED' || status.tx_hash) {
        txHash = status.tx_hash || '';
        fee = status.fee || 0;
        break;
      }
    }

    // 6. Update Final Status (if we got hash)
    if (txHash) {
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'completed',
          tx_hash: txHash,
          tx_fee: fee,
          payout_provider: 'nowpayments',
        })
        .eq('id', withdrawalId);

      // Finalize Wallet Balance (RPC)
      await supabase.rpc('finalize_withdrawal', {
        p_user_id: request.user_id,
        p_amount: request.amount,
      });

      // Log Audit
      await supabase.from('withdrawal_audit_log').insert({
        withdrawal_id: withdrawalId,
        event_type: 'execution_completed',
        actor: 'agent:execution',
        previous_status: 'executing',
        new_status: 'completed',
        metadata: { tx_hash: txHash, provider: 'nowpayments' },
      });
    } else {
      // Left in 'executing' status, waiting for Webhook or background poller
    }

    return { success: true, tx_hash: txHash };
  } catch (error: any) {
    logger.error('Execution Error:', error);

    // Revert status if possible (unless it's a critical unknown state)
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'execution_failed',
        agent_notes: `Execution Error: ${error.message}`,
      })
      .eq('id', withdrawalId);

    // RELEASE RESERVED BALANCE
    const { data: req } = await supabase
      .from('withdrawal_requests')
      .select('user_id, amount')
      .eq('id', withdrawalId)
      .single();
    if (req) {
      await supabase.rpc('release_reserved_balance', {
        p_user_id: req.user_id,
        p_amount: req.amount,
      });
    }

    return { success: false, error: error.message };
  }
}
