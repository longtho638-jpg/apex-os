import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();

  // 1. Get top posts by views
  const { data: topPosts } = await supabase
    .from('blog_posts')
    .select('title, slug, views, published_at')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(10);

  // 2. Calculate aggregate stats
  const { data: allPosts } = await supabase
    .from('blog_posts')
    .select('views');
    
  const totalViews = allPosts?.reduce((sum, post) => sum + (post.views || 0), 0) || 0;
  const totalPosts = allPosts?.length || 0;
  const avgViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

  // 3. Mock Keyword Rankings (Google Search Console integration would go here)
  const keywordRankings = [
    { keyword: 'ai trading signals', position: 12, change: 2 },
    { keyword: 'crypto profit calculator', position: 5, change: 1 },
    { keyword: 'binance rebate', position: 8, change: 0 },
  ];

  return NextResponse.json({
    topPosts,
    overview: {
      totalViews,
      totalPosts,
      avgViews
    },
    keywordRankings
  });
}
