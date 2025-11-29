'use client';

import { useEffect } from 'react';

// Assume types come from @types/telegram-web-app or let it be any for now if types conflict
// The error says "All declarations must have identical modifiers", suggesting a conflict with the installed package.

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initTelegram = () => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand(); // Expand to full height

          // Sync Theme
          const themeParams = tg.themeParams;
          if (themeParams) {
            document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#000000');
            document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#ffffff');
          } else {
            // Fallback
            document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#000000');
            // @ts-ignore
            document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#ffffff');
          }

          // Handle Start Param
          const startParam = tg.initDataUnsafe?.start_param;
          if (startParam) {
            localStorage.setItem('referral_code', startParam);
          }
          return true; // Initialized
        }
        return false; // Not ready
      };

      // Try immediately
      if (!initTelegram()) {
        // If not ready, poll a few times (Telegram script should be fast with beforeInteractive, but just in case)
        const intervalId = setInterval(() => {
            if (initTelegram()) {
                clearInterval(intervalId);
            }
        }, 100);

        // Stop polling after 2 seconds
        setTimeout(() => clearInterval(intervalId), 2000);
      }
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
}
