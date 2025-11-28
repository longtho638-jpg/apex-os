import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Define routing config inline
const locales = ['en', 'vi'];
const defaultLocale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !locales.includes(locale as any)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`./src/messages/${locale}.json`)).default
    };
});
