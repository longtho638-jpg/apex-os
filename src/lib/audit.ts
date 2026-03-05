import { logger } from '@/lib/logger';
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export interface AuditEvent {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLog extends AuditEvent {
  id: string;
  created_at: string;
}

export class AuditService {
  /**
   * Log an audit event
   */
  async log(event: AuditEvent): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: event.userId,
        action: event.action,
        resource_type: event.resourceType,
        resource_id: event.resourceId,
        old_value: event.oldValue,
        new_value: event.newValue,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
      });
    } catch (error) {
      logger.error('Audit log error:', error);
      // Don't throw - audit logging should not break app flow
    }
  }

  /**
   * Get logs by user ID
   */
  async getLogsByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get logs by action type
   */
  async getLogsByAction(action: string, limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get logs by date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date, limit: number = 500): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Export logs to CSV
   */
  async exportLogs(startDate: Date, endDate: Date): Promise<string> {
    const logs = await this.getLogsByDateRange(startDate, endDate, 10000);

    const headers = 'ID,User ID,Action,Resource Type,Resource ID,IP Address,Timestamp,Old Value,New Value\n';
    const rows = logs
      .map((log) => {
        const oldVal = log.oldValue ? `"${JSON.stringify(log.oldValue).replace(/"/g, '""')}"` : '';
        const newVal = log.newValue ? `"${JSON.stringify(log.newValue).replace(/"/g, '""')}"` : '';

        return `${log.id},${log.userId || 'N/A'},${log.action},${log.resourceType || 'N/A'},${log.resourceId || 'N/A'},${log.ipAddress || 'N/A'},${log.created_at},${oldVal},${newVal}`;
      })
      .join('\n');

    return headers + rows;
  }

  /**
   * Delete old logs (retention policy)
   */
  async deleteOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { data, error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      logger.error('Failed to delete old audit logs:', error);
      return 0;
    }

    return data?.length || 0;
  }
}

// Singleton instance
export const auditService = new AuditService();
