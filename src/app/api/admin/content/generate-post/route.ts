import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { topic, keywords } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Use OpenRouter (DeepSeek-V3 or similar for long-form)
    // Fallback to other models if DeepSeek isn't available in specific OpenRouter config
    const model = 'deepseek/deepseek-chat';

    const prompt = `Write a 1500-word SEO-optimized blog post about "${topic}".
    Keywords: ${keywords ? keywords.join(', ') : 'crypto trading, ai signals'}.
    Include:
    - Catchy Title (h1)
    - Meta Description (under 160 chars)
    - Introduction
    - 3-5 Detailed Sections (h2, h3)
    - Conclusion
    - FAQ Section
    Tone: Professional, authoritative, yet accessible to traders.
    Format: Markdown.
    Output as JSON with keys: { "title": "", "meta_description": "", "content": "" }`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://apexrebate.com',
        'X-Title': 'ApexOS Content Gen',
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' } // Force JSON if model supports it, else parse
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content;

    // Attempt to parse JSON
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      // Fallback if model didn't return valid JSON (common with some models)
      console.warn('Failed to parse JSON from AI, using raw content');
      parsedContent = {
        title: topic,
        meta_description: `Learn about ${topic} with ApexOS AI trading insights.`,
        content: generatedContent
      };
    }

    const supabase = getSupabaseClient();
    const slug = generateSlug(parsedContent.title);

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert({
        title: parsedContent.title,
        slug: finalSlug,
        content: parsedContent.content,
        seo_keywords: keywords || [],
        meta_description: parsedContent.meta_description,
        status: 'draft', // Auto-draft for safety
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
    }

    return NextResponse.json({ success: true, post });

  } catch (error: any) {
    console.error('Content Generation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
