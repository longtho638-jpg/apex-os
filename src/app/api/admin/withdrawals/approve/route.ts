import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { executeWithdrawal } from '@/lib/agents/execution-agent';
import { auditService } from '@/lib/audit';

// Mock 2FA verification
async function verify2FA(userId: string, code: string) {
  // In prod, check against Authenticator secret
  return code === '123456'; // Dev backdoor
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { withdrawal_id, two_fa_code, admin_id } = body; // admin_id from session

    // Auth Check (Mock)
    // In prod: verify admin role

    if (!withdrawal_id || !two_fa_code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify 2FA
    if (!await verify2FA(admin_id, two_fa_code)) {
      return NextResponse.json({ error: 'Invalid 2FA Code' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Approve
    const { error } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'approved',
        approved_by: admin_id, // UUID
        approved_at: new Date().toISOString()
      })
      .eq('id', withdrawal_id)
      .eq('status', 'agent_approved'); // Must pass agent check first

    if (error) {
      return NextResponse.json({ error: 'Failed to approve or invalid status' }, { status: 400 });
    }

    // Trigger Execution
    // Fire and forget? Or await?
    // For critical money ops, awaiting is safer to report immediate errors.
    const result = await executeWithdrawal(withdrawal_id);

    // AUDIT LOG: Critical Financial Action
    await auditService.log({
      userId: admin_id,
      action: 'WITHDRAWAL_APPROVED',
      resourceType: 'WITHDRAWAL',
      resourceId: withdrawal_id,
      newValue: { status: 'approved', result }
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Admin Approval Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
