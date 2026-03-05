import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { addOrgMember } from '@/lib/org/org-management-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orgId, userId, role } = body;

    if (!orgId || !userId) {
      return NextResponse.json({ error: 'orgId and userId are required' }, { status: 400 });
    }

    // Verify caller is owner/admin of org
    const { data: membership } = await supabase
      .from('org_members')
      .select('role')
      .eq('org_id', orgId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden: must be org owner or admin' }, { status: 403 });
    }

    await addOrgMember({ orgId, userId, role });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
