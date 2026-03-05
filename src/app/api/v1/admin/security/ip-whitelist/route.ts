import { logger } from '@/lib/logger';

/**
 * IP Whitelist API
 * GET - List current admin's whitelisted IPs
 * POST - Add IP to whitelist
 * DELETE - Remove IP from whitelist
 */

import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';
import { type NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/audit';
import { addIPToWhitelist, getClientIP, removeIPFromWhitelist } from '@/lib/auth/ip-whitelist';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// GET - List whitelisted IPs
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);

    let adminId: string | undefined;
    try {
      const { payload } = await jwtVerify(token, secret);
      adminId = payload.sub;
    } catch (err) {
      logger.error('JWT verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    if (!adminId) {
      return NextResponse.json({ error: 'Admin ID required' }, { status: 401 });
    }

    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('ip_whitelist_enabled, allowed_ips')
      .eq('id', adminId)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const currentIP = getClientIP(request);

    return NextResponse.json({
      success: true,
      data: {
        enabled: admin.ip_whitelist_enabled || false,
        allowedIPs: admin.allowed_ips || [],
        currentIP,
      },
    });
  } catch (error) {
    logger.error('IP whitelist GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add IP to whitelist
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);

    let userId: string | undefined;
    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.sub;
    } catch (err) {
      logger.error('JWT verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { adminId, ip, description } = await request.json();

    const finalAdminId = adminId || userId;

    if (!finalAdminId || !ip) {
      return NextResponse.json({ error: 'Admin ID and IP are required' }, { status: 400 });
    }

    // Add IP to whitelist
    const success = await addIPToWhitelist(finalAdminId, ip);

    if (!success) {
      return NextResponse.json({ error: 'Failed to add IP to whitelist' }, { status: 500 });
    }

    // Log audit action
    await auditService.log({
      userId: finalAdminId,
      action: 'IP_WHITELIST_ADD',
      resourceType: 'IP_WHITELIST',
      resourceId: ip,
      newValue: { description },
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Get updated list
    const { data: admin } = await supabase.from('admin_users').select('allowed_ips').eq('id', finalAdminId).single();

    return NextResponse.json({
      success: true,
      allowedIPs: admin?.allowed_ips || [],
    });
  } catch (error) {
    logger.error('IP whitelist POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove IP from whitelist
export async function DELETE(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);

    let userId: string | undefined;
    try {
      const { payload } = await jwtVerify(token, secret);
      userId = payload.sub;
    } catch (err) {
      logger.error('JWT verification failed:', err);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { adminId, ip } = await request.json();

    const finalAdminId = adminId || userId;

    if (!finalAdminId || !ip) {
      return NextResponse.json({ error: 'Admin ID and IP are required' }, { status: 400 });
    }

    // Remove IP from whitelist
    const success = await removeIPFromWhitelist(finalAdminId, ip);

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove IP from whitelist' }, { status: 500 });
    }

    // Log audit action
    await auditService.log({
      userId: finalAdminId,
      action: 'IP_WHITELIST_REMOVE',
      resourceType: 'IP_WHITELIST',
      resourceId: ip,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Get updated list
    const { data: admin } = await supabase.from('admin_users').select('allowed_ips').eq('id', finalAdminId).single();

    return NextResponse.json({
      success: true,
      allowedIPs: admin?.allowed_ips || [],
    });
  } catch (error) {
    logger.error('IP whitelist DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
