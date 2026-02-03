import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Authorization check (middleware usually handles this, but double check for admin routes)
  // In a real app, check session user role
  const supabase = getSupabaseClient();
  
  try {
    // 1. Calculate MRR (Monthly Recurring Revenue)
    // Sum of all active subscriptions normalized to monthly
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('price, billing_cycle')
      .eq('status', 'active');

    let mrr = 0;
    activeSubs?.forEach(sub => {
        if (sub.billing_cycle === 'monthly') {
            mrr += Number(sub.price);
        } else if (sub.billing_cycle === 'annual') {
            mrr += Number(sub.price) / 12;
        }
    });

    // 2. ARR (Annual Run Rate)
    const arr = mrr * 12;

    // 3. Churn Rate (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: canceledCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'canceled')
      .gte('updated_at', thirtyDaysAgo.toISOString());

    const { count: totalActiveStart } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', thirtyDaysAgo.toISOString()); // Approximation of base

    // Avoid division by zero
    const churnRate = totalActiveStart ? ((canceledCount || 0) / totalActiveStart) * 100 : 0;

    // 4. LTV (Lifetime Value) - Simple approximation: ARPU / Churn
    // ARPU = MRR / Total Users
    const { count: totalCustomers } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
        
    const arpu = totalCustomers ? mrr / totalCustomers : 0;
    // If churn is 0, cap LTV or use a default multiplier
    const ltv = churnRate > 0 ? arpu / (churnRate / 100) : arpu * 24; 

    return NextResponse.json({
        mrr,
        arr,
        churnRate,
        ltv,
        activeSubscribers: totalCustomers
    });

  } catch (error) {
    logger.error('Analytics Revenue Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
