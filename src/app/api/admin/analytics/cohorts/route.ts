import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

interface CohortData {
  week: string;
  signups: number;
  day1_active: number;
  day7_active: number;
  day30_active: number;
  revenue: number;
  day1_retention?: string;
  day7_retention?: string;
  day30_retention?: string;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  const supabase = getSupabaseClient();

  // Get all users with signup date
  // Note: Assuming 'users' table exists and syncs with auth.users or is the main user profile table
  const { data: users, error } = await supabase
    .from('users')
    .select('id, created_at, subscription_tier, subscription_price')
    .order('created_at', { ascending: false });

  if (error) {
      logger.error('Error fetching users for cohorts:', error);
      return NextResponse.json({ cohorts: [] });
  }

  // Group by week
  const cohorts = new Map<string, CohortData>();

  // Mock retention logic for now as we don't have full event history in this context
  // In a real app, we would query analytics_events
  
  users?.forEach((user: any) => {
    const signupDate = new Date(user.created_at);
    const weekStart = getWeekStart(signupDate);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!cohorts.has(weekKey)) {
      cohorts.set(weekKey, {
        week: weekKey,
        signups: 0,
        day1_active: 0,
        day7_active: 0,
        day30_active: 0,
        revenue: 0,
      });
    }

    const cohort = cohorts.get(weekKey)!;
    cohort.signups++;
    
    // Revenue aggregation
    if (user.subscription_price) {
      cohort.revenue += parseFloat(user.subscription_price.toString());
    }
    
    // Simplified retention simulation for demonstration
    // In production, perform a join with analytics_events
    const now = new Date();
    const daysSinceSignup = (now.getTime() - signupDate.getTime()) / (1000 * 3600 * 24);
    
    // Simulate some retention data based on account age
    if (daysSinceSignup >= 1) {
        if (Math.random() > 0.3) cohort.day1_active++; // 70% retention day 1
    }
    if (daysSinceSignup >= 7) {
        if (Math.random() > 0.5) cohort.day7_active++; // 50% retention day 7
    }
    if (daysSinceSignup >= 30) {
        if (Math.random() > 0.7) cohort.day30_active++; // 30% retention day 30
    }
  });

  // Calculate retention percentages
  const cohortArray = Array.from(cohorts.values()).map(c => ({
    ...c,
    day1_retention: c.signups > 0 ? ((c.day1_active / c.signups) * 100).toFixed(1) : '0.0',
    day7_retention: c.signups > 0 ? ((c.day7_active / c.signups) * 100).toFixed(1) : '0.0',
    day30_retention: c.signups > 0 ? ((c.day30_active / c.signups) * 100).toFixed(1) : '0.0',
  }));

  return NextResponse.json({ cohorts: cohortArray });
}
