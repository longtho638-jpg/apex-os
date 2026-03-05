import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Workflow lifecycle control: GET status, PATCH start/stop, DELETE workflow.
 * Railway-inspired: service lifecycle management per org.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: workflow, error } = await supabase
      .from('agent_workflows')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    return NextResponse.json({ workflow });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body as { action: 'start' | 'stop' | 'pause' };

    const statusMap: Record<string, string> = {
      start: 'active',
      stop: 'stopped',
      pause: 'paused',
    };

    const newStatus = statusMap[action];
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action. Use: start, stop, pause' }, { status: 400 });
    }

    const { data: workflow, error } = await supabase
      .from('agent_workflows')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !workflow) {
      return NextResponse.json({ error: 'Workflow not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ workflow, action });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('agent_workflows').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete workflow' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
