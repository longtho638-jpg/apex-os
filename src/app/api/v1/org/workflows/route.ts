import { getAgentSlots, type TierId } from '@apex-os/vibe-payment';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { checkOrgRole } from '@/lib/org/org-role-guard';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = request.nextUrl.searchParams.get('orgId');

    // RBAC: verify user has at least viewer role in org
    if (orgId) {
      const role = await checkOrgRole(user.id, orgId, 'viewer');
      if (!role) {
        return NextResponse.json({ error: 'Forbidden: no access to this org' }, { status: 403 });
      }
    }

    const query = supabase
      .from('agent_workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (orgId) {
      query.eq('org_id', orgId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ workflows: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const { orgId, agentType, name, config } = body;

    if (!agentType || !name) {
      return NextResponse.json({ error: 'agentType and name are required' }, { status: 400 });
    }

    // RBAC: creating workflows requires at least trader role in org
    if (orgId) {
      const role = await checkOrgRole(user.id, orgId, 'trader');
      if (!role) {
        return NextResponse.json({ error: 'Forbidden: trader role required to create workflows' }, { status: 403 });
      }
    }

    // Check agent slot limit based on tier
    const { data: tierData } = await supabase.from('user_tiers').select('tier').eq('user_id', user.id).single();

    const userTier = (tierData?.tier || 'EXPLORER') as TierId;
    const maxSlots = getAgentSlots(userTier);

    // Count existing active workflows
    const { count } = await supabase
      .from('agent_workflows')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if ((count || 0) >= maxSlots) {
      return NextResponse.json(
        { error: `Agent slot limit reached (${maxSlots} for ${userTier} tier). Upgrade by trading more volume.` },
        { status: 403 },
      );
    }

    const { data: workflow, error } = await supabase
      .from('agent_workflows')
      .insert({
        org_id: orgId || null,
        user_id: user.id,
        agent_type: agentType,
        name,
        config: config || {},
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ workflow }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
