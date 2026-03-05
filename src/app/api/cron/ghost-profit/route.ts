import { type NextRequest, NextResponse } from 'next/server';
import { beehiveBrain } from '@/lib/beehive-brain';
import { crmService } from '@/lib/crm-service';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseClient();

    // 1. Get Explorer-tier users (lowest volume tier) for ghost-profit nudge
    // Query CRM pipelines for users not yet at high-volume tiers
    const { data: pipelines, error } = await supabase
      .from('crm_pipelines')
      .select('user_id, metadata')
      .not('stage', 'in', '("CUSTOMER_VIP","CUSTOMER_PRO")');

    if (error) throw error;

    // 2. Calculate "Ghost Profit" for the last 24h
    // In a real app, we would query the 'signals' table for winning signals in the last 24h.
    // For this MVP, we will simulate a "Daily Profit" value.
    const dailyPotentialProfit = Math.floor(Math.random() * 200) + 50; // Random $50 - $250

    let updatedCount = 0;

    for (const pipeline of pipelines || []) {
      const currentGhostProfit = (pipeline.metadata?.ghost_profit || 0) + dailyPotentialProfit;

      // 3. Update Metadata
      await crmService.updatePipelineMetadata(pipeline.user_id, {
        ghost_profit: currentGhostProfit,
        last_ghost_update: new Date().toISOString(),
      });

      // 4. Trigger "WinBack" if Ghost Profit > $500 (The "Cocoon" Trigger)
      if (currentGhostProfit > 500 && currentGhostProfit - dailyPotentialProfit <= 500) {
        // Only trigger once when crossing the threshold
        await beehiveBrain.decidePush({
          userId: pipeline.user_id,
          type: 'SIGNAL_MISSED',
          data: {
            potentialProfit: currentGhostProfit,
            days: 7, // Mocked days
          },
        });
      }

      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      processed: updatedCount,
      dailyProfit: dailyPotentialProfit,
    });
  } catch (error) {
    logger.error('Ghost Profit Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
