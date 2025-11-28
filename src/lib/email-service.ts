import { Resend } from 'resend';

// Fallback to mock if key is missing (for dev/build)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    if (!resend) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Email Service (Mock):', { to, subject });
            return { success: true, id: 'mock-id' };
        }
        console.warn('Email Service: RESEND_API_KEY missing');
        return { success: false, error: 'Configuration error' };
    }

    const data = await resend.emails.send({
      from: 'ApexOS <hello@apex-os.com>',
      to,
      subject,
      html,
    });
    
    if (data.error) {
        console.error('Resend API Error:', data.error);
        return { success: false, error: data.error };
    }

    return { success: true, id: data.data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}
