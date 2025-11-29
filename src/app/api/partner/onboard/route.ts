import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { name, slug, customDomain, primaryColor, logoUrl, adminEmail } = await req.json();
  const supabase = getSupabaseClient();

  // 1. Create Tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({
        name,
        slug,
        custom_domain: customDomain,
        theme_config: { primaryColor, logoUrl },
        subscription_status: 'active'
    })
    .select()
    .single();

  if (tenantError) {
      return NextResponse.json({ error: 'Failed to create tenant' }, { status: 500 });
  }

  // 2. Invite/Create Admin User (Simplified)
  // In reality, trigger Supabase Invite Email or link existing user
  // const { error: userError } = await supabase.auth.admin.inviteUserByEmail(adminEmail, { data: { tenant_id: tenant.id } });

  return NextResponse.json({ success: true, tenant });
}
