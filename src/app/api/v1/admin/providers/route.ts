import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { providerApiSchema } from '@/lib/schemas/provider';

/**
 * GET /api/v1/admin/providers
 * 
 * Fetch all providers with filtering and stats
 * Admin only endpoint
 */
export async function GET(request: NextRequest) {
    // Force rebuild
    try {
        // 1. Verify admin JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                message: 'Missing authorization header'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);

        if (!payload) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired token'
            }, { status: 401 });
        }

        // 2. Check if user is super_admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', (payload as any).sub)
            .single();

        if (userError || !user || user.role !== 'super_admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized. Super admin access required.'
            }, { status: 403 });
        }

        // 3. Parse query parameters
        const { searchParams } = new URL(request.url);
        const assetClass = searchParams.get('asset_class');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        // 4. Build query
        let query = supabaseAdmin
            .from('providers')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (assetClass && assetClass !== 'all') {
            query = query.eq('asset_class', assetClass);
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (search) {
            query = query.or(`provider_code.ilike.%${search}%,provider_name.ilike.%${search}%`);
        }

        const { data: providers, error: providersError } = await query;

        if (providersError) {
            console.error('Providers fetch error:', providersError);
            return NextResponse.json({
                success: false,
                message: 'Failed to fetch providers'
            }, { status: 500 });
        }

        // 5. Calculate stats
        const { data: allProviders } = await supabaseAdmin
            .from('providers')
            .select('asset_class, status')
            .eq('is_active', true);

        const stats = {
            total_active: allProviders?.filter(p => p.status === 'active').length || 0,
            by_asset_class: allProviders?.reduce((acc: Record<string, number>, p) => {
                acc[p.asset_class] = (acc[p.asset_class] || 0) + 1;
                return acc;
            }, {}) || {},
            by_status: allProviders?.reduce((acc: Record<string, number>, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {}) || {}
        };

        // 6. Return response
        return NextResponse.json({
            success: true,
            providers: providers || [],
            total: providers?.length || 0,
            stats
        });

    } catch (error) {
        console.error('[ADMIN] Providers fetch error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

/**
 * POST /api/v1/admin/providers
 * 
 * Create new provider
 * Admin only endpoint
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Verify admin JWT
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({
                success: false,
                message: 'Missing authorization header'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const payload = verifySessionToken(token);

        if (!payload) {
            return NextResponse.json({
                success: false,
                message: 'Invalid or expired token'
            }, { status: 401 });
        }

        // 2. Check if user is super_admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', (payload as any).sub)
            .single();

        if (userError || !user || user.role !== 'super_admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized. Super admin access required.'
            }, { status: 403 });
        }

        // 3. Parse request body
        const body = await request.json();

        // 4. Validate with Zod
        const validationResult = providerApiSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                message: 'Validation failed',
                errors: validationResult.error.format()
            }, { status: 400 });
        }

        const {
            provider_code,
            provider_name,
            asset_class,
            partner_uuid,
            referral_link_template,
            status,
            asset_config,
            regulatory_info,
            api_key,
            api_secret
        } = validationResult.data;

        // 5. Insert provider
        const { data: newProvider, error: insertError } = await supabaseAdmin
            .from('providers')
            .insert({
                provider_code: provider_code.toLowerCase(),
                provider_name,
                asset_class,
                partner_uuid,
                referral_link_template,
                status: status || 'testing',
                asset_config: asset_config || {},
                regulatory_info: regulatory_info || {},
                encrypted_api_key: api_key ? encrypt(api_key) : 'NOT_SET',
                encrypted_api_secret: api_secret ? encrypt(api_secret) : 'NOT_SET',
                created_by: (payload as any).sub,
                updated_by: (payload as any).sub
            })
            .select()
            .single();

        if (insertError) {
            console.error('Provider insert error:', insertError);
            return NextResponse.json({
                success: false,
                message: insertError.message
            }, { status: 400 });
        }

        // 6. Return success
        return NextResponse.json({
            success: true,
            provider: newProvider,
            message: 'Provider created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('[ADMIN] Provider creation error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
