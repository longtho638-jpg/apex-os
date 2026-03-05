import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Competitor data structure
const COMPETITORS = [
  {
    name: '3Commas',
    url: 'https://3commas.io',
    pricing: {
      starter: 29,
      advanced: 49,
      pro: 99,
    },
    features: ['Smart Trading', 'DCA Bot', 'Grid Bot'],
  },
  {
    name: 'Binance Futures',
    url: 'https://www.binance.com/en/futures',
    pricing: {
      free: 0, // Commission-based
    },
    features: ['Advanced Charts', 'API Trading', 'Auto-Invest'],
  },
];

export async function GET() {
  const supabase = getSupabaseClient();

  // Store competitor snapshot
  const timestamp = new Date().toISOString();

  // We'll insert snapshots every time this endpoint is hit?
  // Probably better to check if one exists for today, but for now I'll follow the spec.
  // To prevent spam, maybe we should only insert if requested with a specific flag or check last insert.
  // However, the spec says "Store competitor snapshot" in the GET handler.
  // I'll add a check to see if we already have a snapshot for today to avoid duplicates.

  const today = new Date().toISOString().split('T')[0];

  // Check if we already have snapshots for today (simple optimization)
  // Note: logic is simplified for this task

  const { count } = await supabase
    .from('competitor_snapshots')
    .select('*', { count: 'exact', head: true })
    .gte('snapshot_date', today);

  if (count === 0) {
    for (const comp of COMPETITORS) {
      await supabase.from('competitor_snapshots').insert({
        competitor_name: comp.name,
        pricing: comp.pricing,
        features: comp.features,
        snapshot_date: timestamp,
      });
    }
  }

  return NextResponse.json({
    competitors: COMPETITORS,
    updated_at: timestamp,
  });
}
