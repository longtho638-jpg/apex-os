import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch trending topics (Mocking CoinGecko for now)
    // In production: fetch('https://api.coingecko.com/api/v3/search/trending')
    const trendingTopics = ['Bitcoin Halving Analysis', 'Ethereum Layer 2 Solutions', 'AI in Crypto Trading'];
    const topic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];

    // 2. Call Generator API (Internal)
    // Note: In a real cron, you might call the generation logic directly to avoid self-http calls if blocked
    // But for modularity, we will simulate the logic here or reuse the function if exported.
    // Since we can't easily import the POST handler from another route file in Next.js app dir structure without refactoring,
    // we will reimplement the core logic briefly or assume we call the external URL.

    // For this CLI task, let's just create a draft directly to simulate the "Auto-Generate"

    const supabase = getSupabaseClient();

    // Check if we already posted today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());

    if (count && count > 0) {
      return NextResponse.json({ message: 'Daily post already generated' });
    }

    // Call OpenAI/OpenRouter to generate content
    const prompt = `Write a 1000-word blog post about ${topic} for a crypto trading audience.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexrebate.com',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || 'Content generation failed.';
    const title = `The Ultimate Guide to ${topic}`;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 3. Save to DB
    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        slug: `${slug}-${Date.now()}`, // Ensure uniqueness
        content,
        status: 'draft', // Draft for safety, or 'published' if confident
        seo_keywords: [topic, 'crypto', 'trading'],
        meta_description: `Deep dive into ${topic} and how it affects your trading portfolio.`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, post });

  } catch (error: any) {
    console.error('Auto-Content Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
