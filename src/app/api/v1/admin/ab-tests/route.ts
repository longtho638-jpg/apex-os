import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifySessionToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

const campaignSchema = z.object({
  provider_id: z.string().uuid(),
  name: z.string().min(1),
  status: z.enum(['active', 'paused', 'ended']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  variations: z
    .array(
      z.object({
        template_id: z.string().uuid().optional().nullable(),
        traffic_weight: z.number().min(0).max(100),
        url_slug: z.string().optional().nullable(),
      }),
    )
    .min(2, 'At least 2 variations are required'),
});

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('provider_id');

    let query = supabase
      .from('ab_test_campaigns')
      .select(`
                *,
                variations:ab_test_variations(*)
            `)
      .order('created_at', { ascending: false });

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    const { data: campaigns, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      campaigns: campaigns || [],
    });
  } catch (error) {
    logger.error('Fetch campaigns error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: user } = await supabase.from('users').select('role').eq('id', payload.sub).single();

    if (!user || !['super_admin', 'admin'].includes(user.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = campaignSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const { variations, ...campaignData } = validation.data;

    // Start transaction (Supabase doesn't support transactions via JS client easily, so we do sequential inserts)
    // 1. Create Campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('ab_test_campaigns')
      .insert([campaignData])
      .select()
      .single();

    if (campaignError) throw campaignError;

    // 2. Create Variations
    const variationsWithCampaign = variations.map((v) => ({
      ...v,
      campaign_id: campaign.id,
    }));

    const { error: variationsError } = await supabase.from('ab_test_variations').insert(variationsWithCampaign);

    if (variationsError) {
      // Rollback campaign (manual)
      await supabase.from('ab_test_campaigns').delete().eq('id', campaign.id);
      throw variationsError;
    }

    return NextResponse.json({
      success: true,
      campaign: { ...campaign, variations: variationsWithCampaign },
    });
  } catch (error) {
    logger.error('Create campaign error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
