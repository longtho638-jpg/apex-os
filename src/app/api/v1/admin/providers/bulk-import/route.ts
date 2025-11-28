import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/jwt';
import { encrypt } from '@/lib/encryption';
import { providerApiSchema } from '@/lib/schemas/provider';

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
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }

        // 2. Check if user is super_admin
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('role')
            .eq('id', payload.sub)
            .single();

        if (userError || !user || user.role !== 'super_admin') {
            return NextResponse.json({
                success: false,
                message: 'Unauthorized. Super admin access required.'
            }, { status: 403 });
        }

        // 3. Parse request body
        const body = await request.json();
        const { providers } = body;

        if (!Array.isArray(providers) || providers.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No providers data provided'
            }, { status: 400 });
        }

        let importedCount = 0;
        let failedCount = 0;
        const errors: any[] = [];

        // 4. Process each provider
        for (const providerData of providers) {
            // Validate
            const validationResult = providerApiSchema.safeParse(providerData);

            if (!validationResult.success) {
                failedCount++;
                errors.push({
                    provider_code: providerData.provider_code,
                    error: 'Validation failed',
                    details: validationResult.error.format()
                });
                continue;
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

            // Insert
            const { error: insertError } = await supabaseAdmin
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
                    created_by: payload.sub,
                    updated_by: payload.sub
                });

            if (insertError) {
                failedCount++;
                errors.push({
                    provider_code,
                    error: insertError.message
                });
            } else {
                importedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            imported_count: importedCount,
            failed_count: failedCount,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('[ADMIN] Bulk import error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
