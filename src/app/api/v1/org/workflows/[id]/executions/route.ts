import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Workflow execution history — Railway-inspired observability pattern.
 * Lists past runs for a specific agent workflow.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify workflow ownership
    const { data: workflow } = await supabase
      .from('agent_workflows')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const limit = Number(request.nextUrl.searchParams.get('limit') || '20');
    const offset = Number(request.nextUrl.searchParams.get('offset') || '0');

    const { data: executions, error, count } = await supabase
      .from('workflow_executions')
      .select('*', { count: 'exact' })
      .eq('workflow_id', id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      executions: executions || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
