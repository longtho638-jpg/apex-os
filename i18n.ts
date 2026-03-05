import { getRequestConfig } from 'next-intl/server';
import { locales } from './src/config/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./src/messages/${locale}.json`)).default,
  };
});
