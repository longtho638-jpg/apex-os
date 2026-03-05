import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch Market Data (Mock for now, replace with CoinGecko/Binance API in prod)
    const marketData = {
      btc: 64200,
      eth: 3450,
      sol: 145,
      trend: 'bullish',
      topGainer: 'PEPE (+15%)',
    };

    // 2. Generate Content via OpenRouter (DeepSeek)
    const prompt = `
      Write a professional crypto market analysis for today (${new Date().toLocaleDateString()}).
      Data: BTC $${marketData.btc}, ETH $${marketData.eth}, SOL $${marketData.sol}.
      Trend: ${marketData.trend}. Top Gainer: ${marketData.topGainer}.
      
      Structure:
      1. 🌍 Market Overview (General sentiment)
      2. 🔑 Key Levels to Watch (Support/Resistance for BTC & ETH)
      3. 🚀 Top Movers (Altcoin spotlight)
      4. 🔮 Outlook (Short-term prediction)
      
      Tone: Institutional, concise, actionable.
      Format: Markdown.
      SEO Keywords: Bitcoin analysis, Crypto daily update, ApexOS market watch.
    `;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexrebate.com',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || 'Analysis unavailable.';
    const title = `Market Watch: BTC at $${marketData.btc} - ${new Date().toLocaleDateString()}`;
    const slug = `market-watch-${new Date().toISOString().split('T')[0]}`;

    // 3. Save to Database
    const supabase = getSupabaseClient();

    // Check if post exists for today to prevent duplicates
    const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).single();

    if (!existing) {
      await supabase.from('blog_posts').insert({
        title,
        slug,
        content,
        seo_keywords: ['Bitcoin', 'Crypto Analysis', 'Trading'],
        meta_description: `Daily crypto market analysis: BTC, ETH, and top movers for ${new Date().toLocaleDateString()}.`,
        status: 'published',
        published_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, title });
  } catch (error: any) {
    logger.error('Market Analysis Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
