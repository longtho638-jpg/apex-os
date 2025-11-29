import { getSupabaseClient } from '../supabase';
import type { User } from '@supabase/supabase-js';
import { auditService } from '@/lib/audit';

const supabase = getSupabaseClient();

export interface ApprovalRequest {
    id: string;
    requester_id: string;
    action_type: string;
    payload: any;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
    created_at: string;
    executed_at?: string;
    rejection_reason?: string;
    approvals?: Approval[];
}

export interface Approval {
    id: string;
    request_id: string;
    admin_id: string;
    approved_at: string;
    admin?: {
        email: string;
        full_name: string;
    };
}

export class MultiSigService {

    /**
     * Create a new approval request
     */
    async createRequest(
        requesterId: string,
        actionType: string,
        payload: any
    ): Promise<{ success: boolean; requestId?: string; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('approval_requests')
                .insert({
                    requester_id: requesterId,
                    action_type: actionType,
                    payload
                })
                .select()
                .single();

            if (error) throw error;

            // Log audit event
            await auditService.log({
                userId: requesterId,
                action: 'MULTISIG_REQUEST_CREATED',
                resourceType: 'APPROVAL_REQUEST',
                resourceId: data.id,
                newValue: { actionType, payload },
                ipAddress: 'system', // Should ideally come from context
            });

            return { success: true, requestId: data.id };
        } catch (error: any) {
            console.error('Create approval request error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Approve a request
     */
    async approveRequest(
        requestId: string,
        adminId: string
    ): Promise<{ success: boolean; error?: string; isFullyApproved?: boolean }> {
        try {
            // 1. Check if request exists and is pending
            const { data: request, error: reqError } = await supabase
                .from('approval_requests')
                .select('*')
                .eq('id', requestId)
                .single();

            if (reqError || !request) throw new Error('Request not found');
            if (request.status !== 'PENDING') throw new Error(`Request is ${request.status}`);

            // 2. Check if admin already approved
            const { data: existing } = await supabase
                .from('approvals')
                .select('id')
                .eq('request_id', requestId)
                .eq('admin_id', adminId)
                .single();

            if (existing) throw new Error('You have already approved this request');

            // 3. Add approval
            const { error: approveError } = await supabase
                .from('approvals')
                .insert({
                    request_id: requestId,
                    admin_id: adminId
                });

            if (approveError) throw approveError;

            // 4. Check if fully approved
            const isFullyApproved = await this.checkApprovalStatus(requestId);

            // Log audit
            await auditService.log({
                userId: adminId,
                action: 'MULTISIG_APPROVED',
                resourceType: 'APPROVAL_REQUEST',
                resourceId: requestId,
                ipAddress: 'system'
            });

            return { success: true, isFullyApproved };

        } catch (error: any) {
            console.error('Approve request error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reject a request
     */
    async rejectRequest(
        requestId: string,
        adminId: string,
        reason: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('approval_requests')
                .update({
                    status: 'REJECTED',
                    rejection_reason: reason
                })
                .eq('id', requestId);

            if (error) throw error;

            await auditService.log({
                userId: adminId,
                action: 'MULTISIG_REJECTED',
                resourceType: 'APPROVAL_REQUEST',
                resourceId: requestId,
                newValue: { reason },
                ipAddress: 'system'
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Check if request meets threshold and update status
     */
    private async checkApprovalStatus(requestId: string): Promise<boolean> {
        // Get config
        const { data: settings } = await supabase
            .from('system_settings')
            .select('value')
            .eq('key', 'multisig_config')
            .single();

        const minApprovals = settings?.value?.min_approvals || 2;

        // Count approvals
        const { count } = await supabase
            .from('approvals')
            .select('*', { count: 'exact', head: true })
            .eq('request_id', requestId);

        if ((count || 0) >= minApprovals) {
            // Mark as APPROVED
            await supabase
                .from('approval_requests')
                .update({ status: 'APPROVED' })
                .eq('id', requestId);

            return true;
        }

        return false;
    }

    /**
     * Get all pending requests
     */
    async getPendingRequests(): Promise<ApprovalRequest[]> {
        const { data } = await supabase
            .from('approval_requests')
            .select(`
                *,
                approvals (
                    admin_id,
                    approved_at
                ),
                requester:requester_id (
                    email,
                    full_name
                )
            `)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        return data || [];
    }
}

export const multiSigService = new MultiSigService();
