/**
 * Audit Service
 *
 * Provides centralized audit logging functionality for compliance and security.
 * Wraps the audit_logs table with type-safe functions.
 */

import { createClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_SIGNUP'
  | 'TRADE_EXECUTED'
  | 'WITHDRAWAL_REQUESTED'
  | 'SETTINGS_CHANGED'
  | 'TOS_ACCEPTED'
  | 'PRIVACY_ACCEPTED'
  | 'COOKIE_CONSENT_GIVEN'
  | 'DATA_EXPORT_REQUESTED'
  | 'PASSWORD_CHANGED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED';

export type AuditResourceType =
  | 'USER'
  | 'TRADE'
  | 'WALLET'
  | 'SETTINGS'
  | 'COMPLIANCE';

export interface AuditLogEntry {
  userId?: string;
  action: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: entry.userId || null,
        action: entry.action,
        resource_type: entry.resourceType || null,
        resource_id: entry.resourceId || null,
        old_value: entry.oldValue || null,
        new_value: entry.newValue || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });

    if (error) {
      console.error('[AuditService] Failed to log event:', error);
      // Don't throw - audit logging should not break application flow
    }
  } catch (err) {
    console.error('[AuditService] Exception logging event:', err);
  }
}

/**
 * Log user login
 */
export async function logUserLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'USER_LOGIN',
    resourceType: 'USER',
    resourceId: userId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log ToS acceptance
 */
export async function logTosAcceptance(
  userId: string,
  version: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'TOS_ACCEPTED',
    resourceType: 'COMPLIANCE',
    newValue: { version, acceptedAt: new Date().toISOString() },
    ipAddress,
    userAgent,
  });
}

/**
 * Log Privacy Policy acceptance
 */
export async function logPrivacyAcceptance(
  userId: string,
  version: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'PRIVACY_ACCEPTED',
    resourceType: 'COMPLIANCE',
    newValue: { version, acceptedAt: new Date().toISOString() },
    ipAddress,
    userAgent,
  });
}

/**
 * Log data export request (GDPR)
 */
export async function logDataExportRequest(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'DATA_EXPORT_REQUESTED',
    resourceType: 'COMPLIANCE',
    resourceId: userId,
    ipAddress,
    userAgent,
  });
}
