import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'crypto';

interface AgentCheckResult {
  approved: boolean;
  risk_score?: number;
  reason?: string;
}

export async function agentCheckWithdrawal(withdrawalId: string): Promise<AgentCheckResult> {
  const supabase = getSupabaseClient();

  try {
    // 1. Fetch Request
    const { data: request, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (error || !request) {
      throw new Error('Withdrawal not found');
    }

    // 2. VERIFY CHECKSUM (Integrity Check)
    // Reconstruct hash from stored data + secret
    const nonce = request.agent_notes?.split('nonce:')[1] || '';

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(`${request.user_id}:${request.amount}:${request.crypto_address}:${nonce}:${process.env.SUPABASE_JWT_SECRET}`)
      .digest('hex');

    if (request.data_checksum !== expectedChecksum) {
      await rejectWithdrawal(withdrawalId, 'Data integrity check failed (Checksum Mismatch)');
      return { approved: false, reason: 'Checksum mismatch' };
    }

    // 3. Fraud Detection Logic
    let riskScore = 0;

    // Check 1: High Value
    if (request.amount > 1000) riskScore += 20;
    if (request.amount > 5000) riskScore += 50;
    if (request.amount > 10000) riskScore += 30; // Total 100 -> Auto Flag

    // Check 2: Velocity (Multiple withdrawals in 24h)
    // We'd query withdrawal_requests count here

    // Check 3: Balance Consistency
    // Ensure total_earned >= total_withdrawn + reserved + balance
    // This requires fetching wallet snapshot.

    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', request.user_id)
      .single();

    if (wallet) {
      // Simple sanity check: total_earned should be approx sum of outputs
      // Allow small floating point drift, but huge gap is suspicious
      const accountedFor = wallet.balance_usd + wallet.total_withdrawn + wallet.reserved_balance;
      const gap = Math.abs(wallet.total_earned - accountedFor);

      if (gap > 1.0) { // $1 tolerance
        riskScore += 100; // Critical failure
        console.error(`Balance Mismatch: Earned ${wallet.total_earned} vs Accounted ${accountedFor}`);
      }
    }

    // 4. AML Screening (Mock)
    // In prod, call Chainalysis or similar
    const isBlacklisted = request.crypto_address === 'TBlacklistedAddress123';
    if (isBlacklisted) {
      await rejectWithdrawal(withdrawalId, 'Address Blacklisted (AML)');
      return { approved: false, reason: 'AML Blacklist' };
    }

    // Decision
    if (riskScore >= 80) {
      await flagForManualReview(withdrawalId, riskScore, 'High Risk Score');
      return { approved: false, risk_score: riskScore, reason: 'High Risk' };
    }

    // 5. Approve
    await supabase
      .from('withdrawal_requests')
      .update({
        status: 'agent_approved',
        risk_score: riskScore,
        agent_approved_at: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    // Log Audit
    await supabase.from('withdrawal_audit_log').insert({
      withdrawal_id: withdrawalId,
      event_type: 'agent_approval',
      actor: 'agent:system',
      previous_status: 'pending',
      new_status: 'agent_approved',
      metadata: { risk_score: riskScore }
    });

    return { approved: true, risk_score: riskScore };

  } catch (error: any) {
    console.error('Agent Check Error:', error);
    return { approved: false, reason: error.message };
  }
}

async function rejectWithdrawal(id: string, reason: string) {
  const supabase = getSupabaseClient();

  // Get details to release balance
  const { data: req } = await supabase.from('withdrawal_requests').select('user_id, amount').eq('id', id).single();

  await supabase.from('withdrawal_requests').update({
    status: 'rejected',
    agent_notes: `Rejected: ${reason}`
  }).eq('id', id);

  if (req) {
    await supabase.rpc('release_reserved_balance', {
      p_user_id: req.user_id,
      p_amount: req.amount
    });
  }
}

async function flagForManualReview(id: string, score: number, reason: string) {
  const supabase = getSupabaseClient();
  await supabase.from('withdrawal_requests').update({
    status: 'flagged',
    risk_score: score,
    agent_notes: `Flagged: ${reason}`
  }).eq('id', id);
}
