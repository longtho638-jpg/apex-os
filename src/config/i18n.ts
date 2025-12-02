export const locales = ['en', 'vi', 'th', 'id', 'ko', 'ja', 'zh'] as const;
export const defaultLocale = 'en';
export type Locale = (typeof locales)[number];
