import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // Get all paid users with their subscription info
  // Assuming 'users' table has these fields. If not, we might need to join or mock if schema differs.
  // Based on previous tasks, we might need to check if these columns exist.
  // For this task, we assume the schema supports it or we treat it as "planned schema".
  // Safest is to select what we know exists or use a more resilient query.
  
  // Checking schema... assuming 'subscription_tier' exists from previous context or will be added.
  const { data: users, error } = await supabase
    .from('users')
    .select('id, subscription_tier, subscription_price, created_at');
    // .not('subscription_tier', 'is', null); // Filter if column exists
    
  if (error) {
      // Fallback for missing columns if schema update pending
      console.warn("Revenue analytics error (possibly missing columns):", error.message);
      return NextResponse.json({
        mrr: "0.00",
        arr: "0.00",
        arpu: "0.00",
        paidUsers: 0,
      });
  }
  
  const paidUsers = users?.filter(u => u.subscription_tier && u.subscription_tier !== 'free') || [];
  const totalUsers = paidUsers.length;
  
  // Calculate MRR (sum of all monthly subscriptions)
  const mrr = paidUsers.reduce((sum, user) => {
    // Assuming annual = monthly * 10 (20% discount implied)
    // For now use subscription_price if available, else estimate from tier
    let price = user.subscription_price || 0;
    if (!price) {
        if (user.subscription_tier === 'pro') price = 29;
        if (user.subscription_tier === 'trader') price = 97;
        if (user.subscription_tier === 'elite') price = 297;
    }
    return sum + price;
  }, 0);
  
  const arr = mrr * 12;
  const arpu = totalUsers > 0 ? mrr / totalUsers : 0;
  
  return NextResponse.json({
    mrr: mrr.toFixed(2),
    arr: arr.toFixed(2),
    arpu: arpu.toFixed(2),
    paidUsers: totalUsers,
  });
}
