'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export function TelegramInviteButton({ referralCode }: { referralCode: string }) {
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegram(true);
    }
  }, []);

  const handleInvite = () => {
    const inviteLink = `https://t.me/ApexOS_Bot?start=ref_${referralCode}`;
    const text = `🚀 Use my link to join ApexOS and get 20% off!`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`;
    
    // If in Telegram WebApp, use native method
    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(url);
    } else {
        window.open(url, '_blank');
    }
  };

  if (!isTelegram) return null; // Only show inside Telegram

  return (
    <button
      onClick={handleInvite}
      className="w-full py-3 bg-[#24A1DE] hover:bg-[#24A1DE]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
    >
      <Send className="w-5 h-5" /> Invite Friends on Telegram
    </button>
  );
}
