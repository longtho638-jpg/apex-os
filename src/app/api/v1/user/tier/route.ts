import { getTierById, getTierByVolume, UNIFIED_TIERS } from '@apex-os/vibe-payment';
import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = user.id;

    // RaaS: Fetch user profile + 30-day trading volume
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier, created_at, monthly_volume')
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user tier:', error);
      return NextResponse.json({
        tier: 'EXPLORER',
        tierName: UNIFIED_TIERS.EXPLORER.name,
        monthlyVolume: 0,
        spreadBps: UNIFIED_TIERS.EXPLORER.spreadBps,
        selfRebateRate: UNIFIED_TIERS.EXPLORER.selfRebateRate,
        agentSlots: UNIFIED_TIERS.EXPLORER.agentSlots,
        joined_at: null,
      });
    }

    // Determine tier from volume (RaaS model — tiers unlock by trading volume)
    const monthlyVolume = data.monthly_volume || 0;
    const volumeTierId = getTierByVolume(monthlyVolume);

    // Legacy DB field may still hold old tier name; prefer volume-based calc
    const tierConfig = getTierById(volumeTierId) ?? UNIFIED_TIERS.EXPLORER;

    return NextResponse.json({
      tier: volumeTierId,
      tierName: tierConfig.name,
      monthlyVolume,
      spreadBps: tierConfig.spreadBps,
      selfRebateRate: tierConfig.selfRebateRate,
      agentSlots: tierConfig.agentSlots,
      joined_at: data.created_at,
    });
  } catch (error) {
    logger.error('User tier endpoint error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
