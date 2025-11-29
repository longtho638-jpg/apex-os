import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key_dev_mode');

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email] Missing RESEND_API_KEY');
    return { success: false, error: 'Server configuration error' };
  }

  try {
    const data = await resend.emails.send({
      from: 'ApexOS <onboarding@resend.dev>', // Use verified domain in prod
      to,
      subject,
      html,
    });

    if (data.error) {
        console.error('[Email] Resend API Error:', data.error);
        return { success: false, error: data.error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[Email] Critical Error:', error);
    return { success: false, error: error.message };
  }
}