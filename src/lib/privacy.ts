import { auditService } from './audit';
import { getSupabaseClient } from './supabase';

const supabase = getSupabaseClient();

export class PrivacyService {
  /**
   * Export all personal data associated with a user (GDPR - Right of Access)
   */
  async exportUserData(userId: string) {
    const { data: user, error: userError } = await supabase.from('users').select('*').eq('id', userId).single();

    if (userError) throw new Error(`User fetch failed: ${userError.message}`);

    // Fetch related data in parallel
    const [{ data: transactions }, { data: withdrawals }, { data: auditLogs }, { data: apiKeys }] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId),
      supabase.from('withdrawals').select('*').eq('user_id', userId),
      supabase.from('audit_logs').select('*').eq('user_id', userId),
      supabase.from('api_keys').select('*').eq('user_id', userId),
    ]);

    return {
      generated_at: new Date().toISOString(),
      user_profile: user,
      financial_records: {
        transactions: transactions || [],
        withdrawals: withdrawals || [],
      },
      security_logs: auditLogs || [],
      api_keys: apiKeys || [],
    };
  }

  /**
   * Anonymize user data (GDPR - Right to be Forgotten)
   * NOTE: We DO NOT delete financial records (transactions/withdrawals) due to AML/Tax laws.
   * We only anonymize the PII in the user profile.
   */
  async anonymizeUser(userId: string) {
    // 1. Check if user has pending withdrawals or active positions (Business Logic)
    // For MVP, we'll assume checks are done before calling this.

    const anonymizedEmail = `deleted_${userId.slice(0, 8)}@anon.apex-os.local`;
    const anonymizedName = 'Deleted User';

    // 2. Anonymize User Profile
    const { error } = await supabase
      .from('users')
      .update({
        email: anonymizedEmail,
        full_name: anonymizedName,
        phone_number: null,
        telegram_id: null,
        avatar_url: null,
        is_deleted: true, // Soft delete flag
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw new Error(`Anonymization failed: ${error.message}`);

    // 3. Disable/Delete API Keys
    await supabase.from('api_keys').delete().eq('user_id', userId);

    // 4. Log the action (System level log)
    await auditService.log({
      userId: userId,
      action: 'USER_ANONYMIZED',
      resourceType: 'USER',
      resourceId: userId,
      oldValue: 'PII_DATA',
      newValue: 'ANONYMIZED',
    });

    // 5. (Optional) Clean up Auth User in Supabase Auth (Admin function)
    // This requires Service Role and might be handled by a separate edge function or admin tool.
    // Here we just handle the DB records.

    return true;
  }
}

export const privacyService = new PrivacyService();
