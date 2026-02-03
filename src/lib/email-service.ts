import { logger } from '@/lib/logger';
import { Resend } from 'resend';
import { getSupabaseClient } from '@/lib/supabase';

const resend = new Resend((process.env.RESEND_API_KEY || 're_missing_key_dev_mode').trim());

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: string; // Optional: Link email to a user for CRM
  templateId?: string; // Optional: Track which template was sent
}

export async function sendEmail({ to, subject, html, userId, templateId }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    logger.error('[Email] Missing RESEND_API_KEY');
    return { success: false, error: 'Server configuration error' };
  }

  try {
    const data = await resend.emails.send({
      from: 'ApexOS <noreply@apexrebate.com>', // Verified domain
      to,
      subject,
      html,
    });

    if (data.error) {
      logger.error('[Email] Resend API Error:', data.error);
      // Log Failure to CRM if userId exists
      if (userId) {
        await logEmailToCRM(userId, to, templateId || 'unknown', 'BOUNCED', { error: data.error });
      }
      return { success: false, error: data.error.message };
    }

    // Log Success to CRM
    if (userId) {
      await logEmailToCRM(userId, to, templateId || 'unknown', 'SENT', { resendId: data.data?.id });
    }

    return { success: true };
  } catch (error: any) {
    logger.error('[Email] Critical Error:', error);
    return { success: false, error: error.message };
  }
}

async function logEmailToCRM(userId: string, email: string, templateId: string, status: string, metadata: any) {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('email_logs').insert({
      user_id: userId,
      email_to: email,
      template_id: templateId,
      status,
      metadata
    });

    // Also track as a generic CRM event
    await supabase.from('crm_events').insert({
      user_id: userId,
      event_type: 'EMAIL_SENT',
      metadata: { ...metadata, templateId, status },
      severity: status === 'SENT' ? 'SUCCESS' : 'WARN'
    });
  } catch (e) {
    logger.error('[Email] Failed to log to CRM:', e);
  }
}
