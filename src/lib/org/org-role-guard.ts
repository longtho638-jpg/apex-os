import { getSupabaseClient } from '@/lib/supabase';

export type OrgRole = 'owner' | 'admin' | 'trader' | 'viewer' | 'member';

/**
 * Org RBAC guard — Railway-inspired role-based access per organization.
 *
 * Validates that the user has the required role within the org.
 * Role hierarchy: owner > admin > trader > member > viewer
 */

const ROLE_HIERARCHY: Record<OrgRole, number> = {
  viewer: 1,
  member: 2,
  trader: 3,
  admin: 4,
  owner: 5,
};

/**
 * Check if user has at least the required role in the org.
 * Returns the user's actual role or null if unauthorized.
 */
export async function checkOrgRole(
  userId: string,
  orgId: string,
  requiredRole: OrgRole = 'member'
): Promise<OrgRole | null> {
  const supabase = getSupabaseClient();

  const { data: membership } = await supabase
    .from('org_members')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .single();

  if (!membership) return null;

  const userLevel = ROLE_HIERARCHY[membership.role as OrgRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

  return userLevel >= requiredLevel ? (membership.role as OrgRole) : null;
}

/**
 * Get user's default org_id — first org they belong to.
 */
export async function getUserDefaultOrg(userId: string): Promise<string | null> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from('org_members')
    .select('org_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  return data?.org_id || null;
}
