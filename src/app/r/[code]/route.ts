import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, props: { params: Promise<{ code: string }> }) {
  const params = await props.params;
  const { code } = params;

  // Initialize Supabase (Public client is enough for reading active campaigns if policies allow)
  // However, we might need service role to increment view counts reliably without RLS issues for anon users
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Find the provider by referral code
    // Assuming 'provider_code' in 'providers' table matches the referral code
    // Or if there's a specific 'referral_codes' table.
    // Based on previous context, providers have 'provider_code'.

    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, referral_link_template')
      .eq('provider_code', code)
      .single();

    if (providerError || !provider) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    // 2. Check for ACTIVE A/B Test Campaign
    const now = new Date().toISOString();
    const { data: campaign } = await supabase
      .from('ab_test_campaigns')
      .select(`
                id,
                variations:ab_test_variations(
                    id,
                    template_id,
                    traffic_weight,
                    url_slug,
                    template:referral_templates(html_content)
                )
            `)
      .eq('provider_id', provider.id)
      .eq('status', 'active')
      .lte('start_date', now)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Default destination (if no AB test)
    const _destinationUrl = provider.referral_link_template || 'https://apex.finance'; // Fallback

    // If template logic is needed, we might render HTML here instead of redirecting.
    // But for "Referral Links", usually it redirects to a signup page.
    // IF the requirement is to render a "Landing Page" hosted by us, we should return HTML.
    // The "Template Marketplace" suggests we are hosting the pages.
    // So we should probably return a Response with HTML content if a template is selected.

    if (campaign?.variations && campaign.variations.length > 0) {
      // 3. Traffic Distribution Logic
      // Simple weighted random for now (Option A/B hybrid - we can add cookie stickiness later)

      const totalWeight = campaign.variations.reduce((sum: number, v: any) => sum + v.traffic_weight, 0);
      let random = Math.random() * totalWeight;
      let selectedVariation = campaign.variations[0];

      for (const variation of campaign.variations) {
        random -= variation.traffic_weight;
        if (random <= 0) {
          selectedVariation = variation;
          break;
        }
      }

      // 4. Record View (Async - fire and forget)
      // In a real high-scale app, use a queue. Here, direct DB update is fine for MVP.
      // We haven't created a 'views' table yet, so we'll skip this or log it.
      logger.info(`[AB-TEST] Campaign ${campaign.id} -> Variation ${selectedVariation.id}`);

      // 5. Determine Response
      if (selectedVariation.template) {
        // Render the template
        const templateData = Array.isArray(selectedVariation.template)
          ? selectedVariation.template[0]
          : selectedVariation.template;

        let html = templateData?.html_content || '';
        // Replace variables
        html = html.replace(/{{provider_name}}/g, code.toUpperCase()); // Mock name
        html = html.replace(/{{referral_link}}/g, provider.referral_link_template || '#');

        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      } else if (selectedVariation.url_slug) {
        // Redirect to override URL
        return NextResponse.redirect(new URL(selectedVariation.url_slug, request.url));
      }
    }

    // No A/B test active, or no template selected.
    // If we have a default template system, we would use it here.
    // For now, redirect to the provider's default link or show a basic page.

    if (provider.referral_link_template?.startsWith('http')) {
      return NextResponse.redirect(provider.referral_link_template);
    }

    return new NextResponse(`<h1>Welcome to ${code}</h1><p>Redirecting...</p>`, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    logger.error('Redirect error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
