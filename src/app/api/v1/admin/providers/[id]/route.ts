import { createClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/encryption';
import { verifySessionToken } from '@/lib/jwt';
import { logger } from '@/lib/logger';

/**
 * PATCH /api/v1/admin/providers/[id]
 *
 * Update provider configuration
 * Admin only endpoint
 */
export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 1. Verify admin JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing authorization header',
        },
        { status: 401 },
      );
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
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Super admin access required.',
        },
        { status: 403 },
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const providerId = params.id;

    // Extract allowed update fields
    const allowedFields = [
      'provider_name',
      'partner_uuid',
      'referral_link_template',
      'status',
      'asset_config',
      'regulatory_info',
      'encrypted_api_key',
      'encrypted_api_secret',
      'rate_limit_per_minute',
      'webhook_url',
      'allowed_operations',
      'compliance_metadata',
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle encryption for sensitive fields
        if (field === 'encrypted_api_key' && body.api_key) {
          updateData[field] = encrypt(body.api_key);
        } else if (field === 'encrypted_api_secret' && body.api_secret) {
          updateData[field] = encrypt(body.api_secret);
        } else if (!field.startsWith('encrypted_')) {
          updateData[field] = body[field];
        }
      }
    }

    // Handle explicit api_key/api_secret in body if not mapped to encrypted fields
    if (body.api_key) updateData.encrypted_api_key = encrypt(body.api_key);
    if (body.api_secret) updateData.encrypted_api_secret = encrypt(body.api_secret);

    // Get current version
    const { data: currentProvider } = await supabaseAdmin
      .from('providers')
      .select('version')
      .eq('id', providerId)
      .single();

    // Always increment version
    updateData.version = (currentProvider?.version || 0) + 1;
    updateData.updated_by = payload.sub;
    updateData.updated_at = new Date().toISOString();

    // 4. Update provider
    const { data: updatedProvider, error: updateError } = await supabaseAdmin
      .from('providers')
      .update(updateData)
      .eq('id', providerId)
      .select()
      .single();

    if (updateError) {
      logger.error('Provider update error:', updateError);
      return NextResponse.json(
        {
          success: false,
          message: updateError.message,
        },
        { status: 400 },
      );
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      message: 'Provider updated successfully',
    });
  } catch (error) {
    logger.error('[ADMIN] Provider update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/admin/providers/[id]
 *
 * Soft delete provider (set is_active = false)
 * Admin only endpoint
 */
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // 1. Verify admin JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing authorization header',
        },
        { status: 401 },
      );
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
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized. Super admin access required.',
        },
        { status: 403 },
      );
    }

    // 3. Soft delete (set is_active = false)
    const providerId = params.id;

    const { error: deleteError } = await supabaseAdmin
      .from('providers')
      .update({
        is_active: false,
        status: 'deprecated',
        updated_by: payload.sub,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerId);

    if (deleteError) {
      logger.error('Provider delete error:', deleteError);
      return NextResponse.json(
        {
          success: false,
          message: deleteError.message,
        },
        { status: 400 },
      );
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: 'Provider deactivated successfully',
    });
  } catch (error) {
    logger.error('[ADMIN] Provider delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
      },
      { status: 500 },
    );
  }
}
