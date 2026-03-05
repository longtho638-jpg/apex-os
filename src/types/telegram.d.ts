interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  openTelegramLink: (url: string) => void;
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  backgroundColor?: string;
  textColor?: string;
  initDataUnsafe?: {
    start_param?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
