/**
 * Centralized locale configuration for next-intl
 *
 * This file serves as the single source of truth for all supported locales
 * across the application (middleware, i18n config, layout, etc.)
 */

export const locales = ['en', 'vi', 'th', 'id', 'ko', 'ja', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/**
 * Locale metadata for UI display (language switcher, etc.)
 */
export const localeMetadata: Record<Locale, {
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr'
  },
  vi: {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    dir: 'ltr'
  },
  th: {
    name: 'Thai',
    nativeName: 'ไทย',
    flag: '🇹🇭',
    dir: 'ltr'
  },
  id: {
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: '🇮🇩',
    dir: 'ltr'
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr'
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    dir: 'ltr'
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    dir: 'ltr'
  }
};

/**
 * Check if a given string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}
