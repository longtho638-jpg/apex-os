import { AGENT_EVENTS, createEvent, publish } from '@/lib/agents/agent-event-bus';
import { logger } from '@/lib/logger';
import { getSupabaseClient } from '@/lib/supabase';

export interface CreateOrgInput {
  name: string;
  slug: string;
  ownerId: string;
}

export interface OrgMemberInput {
  orgId: string;
  userId: string;
  role?: 'owner' | 'admin' | 'trader' | 'viewer' | 'member';
}

export async function createOrganization(input: CreateOrgInput) {
  const supabase = getSupabaseClient();
  const { name, slug, ownerId } = input;

  // Create org
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name, slug, owner_id: ownerId })
    .select('id, name, slug')
    .single();

  if (error) {
    logger.error('[Org] Failed to create organization:', error);
    throw new Error(`Failed to create org: ${error.message}`);
  }

  // Add owner as member
  await supabase.from('org_members').insert({
    org_id: org.id,
    user_id: ownerId,
    role: 'owner',
  });

  // Link user to org
  await supabase.from('users').update({ org_id: org.id }).eq('id', ownerId);

  // Emit event for orchestrator
  await publish(
    createEvent(
      AGENT_EVENTS.ORG_CREATED,
      'org-service',
      { orgId: org.id, ownerId, name, slug },
      { orgId: org.id, userId: ownerId },
    ),
  );

  return org;
}

export async function addOrgMember(input: OrgMemberInput) {
  const supabase = getSupabaseClient();
  const { orgId, userId, role = 'member' } = input;

  const { error } = await supabase.from('org_members').insert({
    org_id: orgId,
    user_id: userId,
    role,
  });

  if (error) {
    logger.error('[Org] Failed to add member:', error);
    throw new Error(`Failed to add member: ${error.message}`);
  }

  // Link user to org
  await supabase.from('users').update({ org_id: orgId }).eq('id', userId);

  await publish(createEvent(AGENT_EVENTS.ORG_MEMBER_ADDED, 'org-service', { orgId, userId, role }, { orgId, userId }));
}

export async function getOrgById(orgId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*, org_members(user_id, role, joined_at)')
    .eq('id', orgId)
    .single();

  if (error) return null;
  return data;
}

export async function getUserOrgs(userId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('org_members')
    .select('org_id, role, organizations(id, name, slug, plan, status, monthly_volume)')
    .eq('user_id', userId);

  return data || [];
}

export async function getOrgAgentWorkflows(orgId: string) {
  const supabase = getSupabaseClient();
  const { data } = await supabase
    .from('agent_workflows')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false });

  return data || [];
}
