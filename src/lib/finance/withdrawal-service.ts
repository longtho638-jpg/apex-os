import { auditService } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { multiSigService } from '@/lib/security/multi-sig';
import { getSupabaseClient } from '../supabase';

const supabase = getSupabaseClient();

export class WithdrawalService {
  /**
   * Request a withdrawal
   * Checks threshold and either processes it or creates a multi-sig request
   */
  async requestWithdrawal(
    adminId: string,
    amount: number,
    destinationAddress: string,
    currency: string = 'USDT',
  ): Promise<{ success: boolean; status: string; message?: string; requestId?: string }> {
    try {
      // 1. Get system settings for threshold
      const { data: settings } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'multisig_config')
        .single();

      const threshold = settings?.value?.high_risk_threshold || 10000;

      // 2. Check if amount exceeds threshold
      if (amount >= threshold) {
        // Create Multi-Sig Request
        const result = await multiSigService.createRequest(adminId, 'WITHDRAWAL', {
          amount,
          currency,
          destinationAddress,
        });

        if (!result.success) throw new Error(result.error);

        // Log tentative withdrawal record
        await supabase.from('withdrawals').insert({
          admin_id: adminId,
          amount,
          currency,
          destination_address: destinationAddress,
          status: 'REQUIRES_APPROVAL',
        });

        return {
          success: true,
          status: 'REQUIRES_APPROVAL',
          message: `Amount exceeds limit of ${threshold}. Approval request created.`,
          requestId: result.requestId,
        };
      }

      // 3. Process immediately (Mock processing)
      const { error } = await supabase.from('withdrawals').insert({
        admin_id: adminId,
        amount,
        currency,
        destination_address: destinationAddress,
        status: 'COMPLETED', // Instant success for demo
        tx_hash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock hash
      });

      if (error) throw error;

      await auditService.log({
        userId: adminId,
        action: 'WITHDRAWAL_PROCESSED',
        resourceType: 'FINANCE',
        resourceId: 'new_withdrawal',
        newValue: { amount, currency, destinationAddress },
        ipAddress: 'system',
      });

      return {
        success: true,
        status: 'COMPLETED',
        message: 'Withdrawal processed successfully.',
      };
    } catch (error: any) {
      logger.error('Withdrawal request error:', error);
      return { success: false, status: 'FAILED', message: error.message };
    }
  }
}

export const withdrawalService = new WithdrawalService();
