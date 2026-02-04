export const dynamic = 'force-dynamic';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { NextIntlClientProvider } from 'next-intl';
import { WagmiProvider } from '@/components/providers/WagmiProvider';
import { cn } from '@/lib/utils';
import "../globals.css";
import { Toaster } from 'sonner';
import { NotificationsProvider } from '@/components/providers/NotificationsProvider';
import { locales, isValidLocale } from '@/config/locales';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ApexOS - AI Trading Operations",
    description: "Intelligent trading operations powered by AI agents",
};

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

async function ApexLayout({ children, params }: Props) {
    // Get locale and validate
    const { locale } = await params;

    if (!isValidLocale(locale)) {
        notFound();
    }

    // Manually load messages (avoid getMessages() which requires config resolution)
    const messages = (await import(`../../../messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <WagmiProvider>
                <AuthProvider>
                    <NotificationsProvider>
                        {children}
                        <Toaster position="top-center" richColors theme="dark" />
                    </NotificationsProvider>
                </AuthProvider>
            </WagmiProvider>
        </NextIntlClientProvider>
    );
}

export default ApexLayout;