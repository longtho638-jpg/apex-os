import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = 'https://apexrebate.com'; // Replace with actual URL

export async function POST(req: NextRequest) {
  // 1. Verify Secret Token
  const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
  if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const update = await req.json();

  if (update.message) {
    const chatId = update.message.chat.id;
    const text = update.message.text || '';

    // Handle /start command
    if (text.startsWith('/start')) {
      // Check for referral code: /start ref_123
      const args = text.split(' ')[1];
      let referralCode = null;
      if (args && args.startsWith('ref_')) {
        referralCode = args.replace('ref_', '');
        // Store referral intent temporarily or handle on WebApp launch
        // For this implementation, we pass it as a start_param to the Web App
      }

      const startParam = referralCode ? `?start_param=${referralCode}` : '';

      await sendMessage(chatId, {
        text: "🚀 Welcome to ApexOS!\n\nInstitutional-grade AI trading signals in your pocket.\n\n👇 Click below to start trading:",
        reply_markup: {
          inline_keyboard: [[
            { text: "Open ApexOS 📱", web_app: { url: `${WEB_APP_URL}${startParam}` } }
          ]]
        }
      });
    }

    // Handle /help
    else if (text.startsWith('/help')) {
      await sendMessage(chatId, {
        text: "Need help? Contact support@apexos.com or join our community channel."
      });
    }
  }

  return NextResponse.json({ ok: true });
}

async function sendMessage(chatId: number | string, payload: any) {
  if (!BOT_TOKEN) return;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, ...payload })
  });
}
